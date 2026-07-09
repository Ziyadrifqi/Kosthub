package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
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

// VerifyTx melakukan verifikasi payment dalam SATU transaction:
// update status payment -> verified/rejected, dan kalau verified,
// booking terkait ikut di-update jadi "confirmed"
func (r *PaymentRepository) VerifyTx(paymentID uuid.UUID, approve bool, adminID uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var payment models.Payment
		if err := tx.Where("id = ?", paymentID).First(&payment).Error; err != nil {
			return err
		}

		newStatus := "rejected"
		if approve {
			newStatus = "verified"
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

		return nil
	})
}
