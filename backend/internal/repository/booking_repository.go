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
