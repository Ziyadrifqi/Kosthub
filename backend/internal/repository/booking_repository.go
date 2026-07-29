package repository

import (
	"errors"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrRoomNotAvailable = errors.New("room is not available")

const bookingExpiryDuration = 24 * time.Hour

type BookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

func (r *BookingRepository) CreateBookingTx(booking *models.Booking) error {
	expiresAt := time.Now().Add(bookingExpiryDuration)
	booking.ExpiresAt = &expiresAt

	return r.db.Transaction(func(tx *gorm.DB) error {
		var room models.Room

		if err := tx.Clauses(clauseForUpdate()).
			Where("id = ?", booking.RoomID).
			First(&room).Error; err != nil {
			return err
		}

		if room.Status != "available" {
			return ErrRoomNotAvailable
		}

		if err := tx.Create(booking).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.Room{}).
			Where("id = ?", booking.RoomID).
			Update("status", "booked").Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *BookingRepository) FindByUserID(userID uuid.UUID, page, limit int) ([]models.Booking, int64, error) {
	var bookings []models.Booking
	var total int64

	query := r.db.Model(&models.Booking{}).
		Preload("Room").
		Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&bookings).Error; err != nil {
		return nil, 0, err
	}

	return bookings, total, nil
}

func (r *BookingRepository) FindByID(id uuid.UUID) (*models.Booking, error) {
	var booking models.Booking
	err := r.db.Preload("Room").Preload("User").Where("id = ?", id).First(&booking).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

// ExpirePendingBookings mencari booking pending yang sudah lewat batas waktu
// dan belum ada payment sama sekali, lalu cancel booking + kembalikan status kamar.
// Ini dipanggil berkala oleh background worker, BUKAN dari request user.
func (r *BookingRepository) ExpirePendingBookingsWithUsers() (int, []uuid.UUID, error) {
	var expiredBookings []models.Booking

	err := r.db.
		Where("status = ? AND expires_at < ?", "pending", time.Now()).
		Find(&expiredBookings).Error
	if err != nil {
		return 0, nil, err
	}

	count := 0
	var affectedUsers []uuid.UUID

	for _, booking := range expiredBookings {
		err := r.db.Transaction(func(tx *gorm.DB) error {
			var b models.Booking
			if err := tx.Clauses(clauseForUpdate()).
				Where("id = ? AND status = ?", booking.ID, "pending").
				First(&b).Error; err != nil {
				return err
			}

			var paymentCount int64
			tx.Model(&models.Payment{}).Where("booking_id = ?", b.ID).Count(&paymentCount)
			if paymentCount > 0 {
				return nil
			}

			if err := tx.Model(&b).Update("status", "cancelled").Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Room{}).
				Where("id = ?", b.RoomID).
				Update("status", "available").Error; err != nil {
				return err
			}

			affectedUsers = append(affectedUsers, b.UserID)
			return nil
		})

		if err == nil {
			count++
		}
	}

	return count, affectedUsers, nil
}

// CompleteExpiredLeases mencari booking confirmed yang tanggal selesainya
// (check_in + duration_months) sudah lewat, tandai completed & kamar balik available.
func (r *BookingRepository) CompleteExpiredLeases() (int, error) {
	var bookings []models.Booking
	err := r.db.
		Where("status = ? AND (check_in + (duration_months || ' months')::interval) <= ?", "confirmed", time.Now()).
		Find(&bookings).Error
	if err != nil {
		return 0, err
	}

	count := 0
	for _, booking := range bookings {
		// skip kalau masih ada pengajuan perpanjangan yang belum selesai diproses —
		// beri kesempatan staff verifikasi dulu sebelum kamar "ditutup"
		var pendingExt int64
		r.db.Model(&models.ExtensionRequest{}).
			Where("booking_id = ? AND status IN ?", booking.ID, []string{"pending_payment", "waiting_verification"}).
			Count(&pendingExt)
		if pendingExt > 0 {
			continue
		}

		err := r.db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Model(&models.Booking{}).Where("id = ? AND status = ?", booking.ID, "confirmed").
				Update("status", "completed").Error; err != nil {
				return err
			}
			return tx.Model(&models.Room{}).Where("id = ?", booking.RoomID).
				Update("status", "available").Error
		})
		if err == nil {
			count++
		}
	}
	return count, nil
}

// FindEndingSoon — booking confirmed yang bakal habis masa sewanya dalam N hari ke depan,
// buat staff siap-siap (foto ulang, pasang iklan) sebelum kamar beneran kosong.
func (r *BookingRepository) FindEndingSoon(branchID *uint, withinDays int) ([]models.Booking, error) {
	var bookings []models.Booking
	query := r.db.Preload("User").Preload("Room").Preload("Room.Branch").
		Where("bookings.status = ?", "confirmed").
		Where("(bookings.check_in + (bookings.duration_months || ' months')::interval) <= ?", time.Now().AddDate(0, 0, withinDays))

	if branchID != nil {
		query = query.Joins("JOIN rooms ON rooms.id = bookings.room_id").
			Where("rooms.branch_id = ?", *branchID)
	}

	err := query.Order("bookings.check_in asc").Find(&bookings).Error
	return bookings, err
}

type DirectBookingInput struct {
	UserID         uuid.UUID
	RoomID         uint
	CheckIn        time.Time
	DurationMonths int
	TotalPrice     float64
	CreatedByStaff uuid.UUID
	PaymentMethod  string
	PaymentNote    string
	ProofURL       *string
}

func (r *BookingRepository) CreateDirectBookingTx(input DirectBookingInput) (*models.Booking, error) {
	var booking models.Booking

	err := r.db.Transaction(func(tx *gorm.DB) error {
		var room models.Room
		if err := tx.Clauses(clauseForUpdate()).Where("id = ?", input.RoomID).First(&room).Error; err != nil {
			return err
		}
		if room.Status != "available" {
			return ErrRoomNotAvailable
		}

		booking = models.Booking{
			UserID:         input.UserID,
			RoomID:         input.RoomID,
			CheckIn:        input.CheckIn,
			DurationMonths: input.DurationMonths,
			TotalPrice:     input.TotalPrice,
			Status:         "confirmed",
		}
		if err := tx.Create(&booking).Error; err != nil {
			return err
		}

		if err := tx.Model(&models.Room{}).Where("id = ?", input.RoomID).Update("status", "booked").Error; err != nil {
			return err
		}

		method := input.PaymentMethod
		if method != "cash" && method != "manual_transfer" {
			method = "cash" // fallback aman kalau ada nilai aneh
		}

		payment := models.Payment{
			BookingID: booking.ID,
			Method:    method,
			Amount:    input.TotalPrice,
			Status:    "verified",
			ProofURL:  input.ProofURL,
		}
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		note := "Booking langsung di lokasi, dikonfirmasi oleh staff."
		if input.PaymentNote != "" {
			note = input.PaymentNote
		}
		auditLog := models.PaymentAuditLog{
			PaymentID:   payment.ID,
			Action:      "verified",
			PerformedBy: input.CreatedByStaff,
			Note:        &note,
		}
		return tx.Create(&auditLog).Error
	})

	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *BookingRepository) FindUpcomingCheckIns(branchID *uint) ([]models.Booking, error) {
	var bookings []models.Booking
	query := r.db.Preload("User").Preload("Room").Preload("Room.Branch").
		Where("bookings.status = ? AND bookings.actual_check_in_at IS NULL", "confirmed")

	if branchID != nil {
		query = query.Joins("JOIN rooms ON rooms.id = bookings.room_id").
			Where("rooms.branch_id = ?", *branchID)
	}

	err := query.Order("bookings.check_in asc").Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) UpdateCheckInDate(id uuid.UUID, newDate time.Time) error {
	return r.db.Model(&models.Booking{}).Where("id = ?", id).Update("check_in", newDate).Error
}

func (r *BookingRepository) MarkCheckedIn(id uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&models.Booking{}).Where("id = ?", id).Update("actual_check_in_at", now).Error
}

// FindNeedingExtensionReminder — booking confirmed yang tanggal habisnya PERSIS 5 hari
// lagi, dan belum pernah dikirim reminder.
func (r *BookingRepository) FindNeedingExtensionReminder() ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.
		Where("status = ? AND reminder_sent_at IS NULL", "confirmed").
		Where("(check_in + (duration_months || ' months')::interval)::date = ?", time.Now().AddDate(0, 0, 5).Format("2006-01-02")).
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepository) MarkReminderSent(id uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&models.Booking{}).Where("id = ?", id).Update("reminder_sent_at", now).Error
}
