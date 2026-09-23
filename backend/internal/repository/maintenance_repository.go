package repository

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

var ErrNotYourTenancy = errors.New("kamu hanya bisa melapor kerusakan untuk kamar yang pernah/sedang kamu tempati")

type MaintenanceRepository struct {
	db *gorm.DB
}

func NewMaintenanceRepository(db *gorm.DB) *MaintenanceRepository {
	return &MaintenanceRepository{db: db}
}

func (r *MaintenanceRepository) Create(t *models.MaintenanceTicket) error {
	return r.db.Create(t).Error
}

func (r *MaintenanceRepository) FindByUserID(userID string) ([]models.MaintenanceTicket, error) {
	var tickets []models.MaintenanceTicket
	err := r.db.Preload("Room").
		Where("reported_by = ?", userID).
		Order("created_at desc").
		Find(&tickets).Error
	return tickets, err
}

func (r *MaintenanceRepository) FindByBranch(branchID *uint, status string) ([]models.MaintenanceTicket, error) {
	var tickets []models.MaintenanceTicket
	query := r.db.Preload("Room").Preload("Room.Branch").Preload("Reporter")

	if status != "" {
		query = query.Where("maintenance_tickets.status = ?", status)
	}

	if branchID != nil {
		query = query.Joins("JOIN rooms ON rooms.id = maintenance_tickets.room_id").
			Where("rooms.branch_id = ?", *branchID)
	}

	err := query.Order("maintenance_tickets.created_at desc").Find(&tickets).Error
	return tickets, err
}

func (r *MaintenanceRepository) FindByID(id uint) (*models.MaintenanceTicket, error) {
	var t models.MaintenanceTicket
	err := r.db.Preload("Room").Preload("Reporter").Where("id = ?", id).First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *MaintenanceRepository) UpdateStatus(id uint, status string) error {
	updates := map[string]interface{}{"status": status}
	if status == "resolved" {
		updates["resolved_at"] = gorm.Expr("now()")
	}
	return r.db.Model(&models.MaintenanceTicket{}).Where("id = ?", id).Updates(updates).Error
}

// VerifyTenancy — customer cuma boleh lapor kerusakan kamar yang PERNAH dia booking
// (confirmed/completed), bukan sembarang kamar.
func (r *MaintenanceRepository) VerifyTenancy(userID string, roomID uint) (bool, error) {
	var count int64
	err := r.db.Table("bookings").
		Where("user_id = ? AND room_id = ? AND status IN ?", userID, roomID, []string{"confirmed", "completed"}).
		Count(&count).Error
	return count > 0, err
}
