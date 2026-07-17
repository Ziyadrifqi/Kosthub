package repository

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CancellationRepository struct {
	db *gorm.DB
}

func NewCancellationRepository(db *gorm.DB) *CancellationRepository {
	return &CancellationRepository{db: db}
}

func (r *CancellationRepository) Create(req *models.CancellationRequest) error {
	return r.db.Create(req).Error
}

func (r *CancellationRepository) FindPending(branchID *uint) ([]models.CancellationRequest, error) {
	var reqs []models.CancellationRequest
	query := r.db.Preload("User").Preload("Booking").Preload("Booking.Room").
		Where("cancellation_requests.status = ?", "pending")

	if branchID != nil {
		query = query.Joins("JOIN bookings ON bookings.id = cancellation_requests.booking_id").
			Joins("JOIN rooms ON rooms.id = bookings.room_id").
			Where("rooms.branch_id = ?", *branchID)
	}

	err := query.Order("cancellation_requests.created_at asc").Find(&reqs).Error
	return reqs, err
}

func (r *CancellationRepository) FindByID(id uuid.UUID) (*models.CancellationRequest, error) {
	var req models.CancellationRequest
	err := r.db.Preload("Booking").Preload("Booking.Room").Preload("User").
		Where("id = ?", id).First(&req).Error
	if err != nil {
		return nil, err
	}
	return &req, nil
}

// ProcessTx approve/reject pengajuan cancel, sekaligus update booking & room kalau disetujui —
// dibungkus transaction supaya konsisten.
func (r *CancellationRepository) ProcessTx(id uuid.UUID, approve bool, adminID uuid.UUID, note string) (*models.CancellationRequest, error) {
	var req models.CancellationRequest

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(clauseForUpdate()).Where("id = ? AND status = ?", id, "pending").First(&req).Error; err != nil {
			return err
		}

		newStatus := "rejected"
		if approve {
			newStatus = "approved"
		}

		now := time.Now()
		updates := map[string]interface{}{
			"status":       newStatus,
			"processed_by": adminID,
			"processed_at": now,
		}
		if note != "" {
			updates["admin_note"] = note
		}

		if err := tx.Model(&req).Updates(updates).Error; err != nil {
			return err
		}

		if approve {
			var booking models.Booking
			if err := tx.Where("id = ?", req.BookingID).First(&booking).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Booking{}).Where("id = ?", req.BookingID).
				Update("status", "cancelled").Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Room{}).Where("id = ?", booking.RoomID).
				Update("status", "available").Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return &req, nil
}
