package repository

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrExtensionPending    = errors.New("sudah ada pengajuan perpanjangan yang sedang diproses untuk booking ini")
	ErrBookingAlreadyEnded = errors.New("masa sewa sudah habis, tidak bisa diajukan perpanjangan lagi")
	ErrExtensionNotFound   = errors.New("pengajuan perpanjangan tidak ditemukan")
)

type ExtensionRepository struct {
	db *gorm.DB
}

func NewExtensionRepository(db *gorm.DB) *ExtensionRepository {
	return &ExtensionRepository{db: db}
}

func (r *ExtensionRepository) Create(ext *models.ExtensionRequest) error {
	return r.db.Create(ext).Error
}

func (r *ExtensionRepository) HasPending(bookingID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.ExtensionRequest{}).
		Where("booking_id = ? AND status IN ?", bookingID, []string{"pending_payment", "waiting_verification"}).
		Count(&count).Error
	return count > 0, err
}

func (r *ExtensionRepository) FindByID(id uuid.UUID) (*models.ExtensionRequest, error) {
	var ext models.ExtensionRequest
	err := r.db.Preload("Booking").Preload("Booking.User").Preload("Booking.Room").
		Where("id = ?", id).First(&ext).Error
	if err != nil {
		return nil, err
	}
	return &ext, nil
}

func (r *ExtensionRepository) UploadProof(id uuid.UUID, proofURL string) error {
	return r.db.Model(&models.ExtensionRequest{}).Where("id = ?", id).
		Updates(map[string]interface{}{"proof_url": proofURL, "status": "waiting_verification"}).Error
}

func (r *ExtensionRepository) FindWaitingByBranch(branchID *uint) ([]models.ExtensionRequest, error) {
	var exts []models.ExtensionRequest
	query := r.db.Preload("Booking").Preload("Booking.User").Preload("Booking.Room").
		Where("extension_requests.status = ?", "waiting_verification")

	if branchID != nil {
		query = query.Joins("JOIN bookings ON bookings.id = extension_requests.booking_id").
			Joins("JOIN rooms ON rooms.id = bookings.room_id").
			Where("rooms.branch_id = ?", *branchID)
	}

	err := query.Order("extension_requests.created_at asc").Find(&exts).Error
	return exts, err
}

// ProcessTx approve/reject perpanjangan. Kalau approve: nambah duration_months booking
// dan total_price, TAPI tanggal berlakunya otomatis dihitung dari check_in + duration lama
// (bukan dari tanggal bayar) — karena kita cuma nambah angka duration_months, bukan ubah check_in.
func (r *ExtensionRepository) ProcessTx(id uuid.UUID, approve bool, adminID uuid.UUID, note string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var ext models.ExtensionRequest
		if err := tx.Clauses(clauseForUpdate()).Where("id = ? AND status = ?", id, "waiting_verification").First(&ext).Error; err != nil {
			return ErrExtensionNotFound
		}

		newStatus := "rejected"
		if approve {
			newStatus = "verified"
		}

		updates := map[string]interface{}{"status": newStatus, "verified_by": adminID}
		if note != "" {
			updates["admin_note"] = note
		}
		if err := tx.Model(&ext).Updates(updates).Error; err != nil {
			return err
		}

		if approve {
			// nambah duration_months & total_price di booking asli —
			// tanggal berakhir baru otomatis = check_in + (duration lama + tambahan)
			if err := tx.Model(&models.Booking{}).Where("id = ?", ext.BookingID).
				Updates(map[string]interface{}{
					"duration_months": gorm.Expr("duration_months + ?", ext.AdditionalMonths),
					"total_price":     gorm.Expr("total_price + ?", ext.TotalPrice),
				}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
