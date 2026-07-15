package repository

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrPaymentAlreadyProcessed = errors.New("payment has already been verified or rejected")
	ErrRejectReasonRequired    = errors.New("note is required when rejecting a payment")
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

func (r *PaymentRepository) FindByBookingID(bookingID uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Where("booking_id = ?", bookingID).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *PaymentRepository) FindByID(id uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Preload("Booking").Where("id = ?", id).First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// FindPending mengambil semua payment yang masih menunggu verifikasi admin,
// memanfaatkan index payments(status)
func (r *PaymentRepository) FindPending(page, limit int) ([]models.Payment, int64, error) {
	var payments []models.Payment
	var total int64

	query := r.db.Model(&models.Payment{}).
		Preload("Booking").
		Preload("Booking.Room").
		Preload("Booking.User").
		Where("status = ?", "waiting_verification")

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

	if err := query.Order("created_at asc").Limit(limit).Offset(offset).Find(&payments).Error; err != nil {
		return nil, 0, err
	}

	return payments, total, nil
}

// VerifyTx melakukan verifikasi payment dengan proteksi anti-kecurangan:
// - Lock baris payment (FOR UPDATE) supaya tidak ada dua admin verifikasi bersamaan
// - Tolak jika payment sudah pernah diproses sebelumnya (tidak bisa dibalik diam-diam)
// - Wajib ada catatan/alasan kalau reject
// - Setiap aksi dicatat permanen ke payment_audit_logs (append-only, tidak bisa diedit/dihapus)
func (r *PaymentRepository) VerifyTx(paymentID uuid.UUID, approve bool, adminID uuid.UUID, note, ipAddress string) error {
	if !approve && note == "" {
		return ErrRejectReasonRequired
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		var payment models.Payment

		if err := tx.Clauses(clauseForUpdate()).
			Where("id = ?", paymentID).
			First(&payment).Error; err != nil {
			return err
		}

		if payment.Status != "waiting_verification" {
			return ErrPaymentAlreadyProcessed
		}

		newStatus := "rejected"
		action := "rejected"
		if approve {
			newStatus = "verified"
			action = "verified"
		}

		if err := tx.Model(&payment).Updates(map[string]interface{}{
			"status":      newStatus,
			"verified_by": adminID,
		}).Error; err != nil {
			return err
		}

		if approve {
			if err := tx.Model(&models.Booking{}).
				Where("id = ?", payment.BookingID).
				Update("status", "confirmed").Error; err != nil {
				return err
			}
		}

		var notePtr *string
		if note != "" {
			notePtr = &note
		}
		var ipPtr *string
		if ipAddress != "" {
			ipPtr = &ipAddress
		}

		log := &models.PaymentAuditLog{
			PaymentID:   paymentID,
			Action:      action,
			PerformedBy: adminID,
			Note:        notePtr,
			IPAddress:   ipPtr,
		}
		if err := tx.Create(log).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *PaymentRepository) FindAuditLogsByPaymentID(paymentID uuid.UUID) ([]models.PaymentAuditLog, error) {
	var logs []models.PaymentAuditLog
	err := r.db.Preload("Performer").
		Where("payment_id = ?", paymentID).
		Order("created_at asc").
		Find(&logs).Error
	return logs, err
}

type AuditLogFilter struct {
	Action string // "verified", "rejected", atau kosong untuk semua
	Page   int
	Limit  int
}

func (r *PaymentRepository) FindAllAuditLogs(filter AuditLogFilter) ([]models.PaymentAuditLog, int64, error) {
	var logs []models.PaymentAuditLog
	var total int64

	query := r.db.Model(&models.PaymentAuditLog{}).
		Preload("Performer").
		Preload("Payment").
		Preload("Payment.Booking").
		Preload("Payment.Booking.Room").
		Preload("Payment.Booking.User")

	if filter.Action != "" {
		query = query.Where("action = ?", filter.Action)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
