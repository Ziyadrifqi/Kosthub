package repository

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrRoomNotAvailable = errors.New("room is not available")

type BookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

// CreateBookingTx menjalankan seluruh proses booking dalam SATU transaction:
// 1. Lock baris room (SELECT FOR UPDATE) supaya tidak ada race condition
// 2. Cek status room masih "available"
// 3. Insert booking baru
// 4. Update status room jadi "booked"
// Kalau salah satu langkah gagal, semua di-rollback otomatis oleh GORM.
func (r *BookingRepository) CreateBookingTx(booking *models.Booking) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var room models.Room

		// LOCK baris room ini sampai transaction selesai — user lain yang coba
		// booking room yang sama akan MENUNGGU di baris ini, bukan langsung error.
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
