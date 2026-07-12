package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type BuildingRepository struct {
	db *gorm.DB
}

func NewBuildingRepository(db *gorm.DB) *BuildingRepository {
	return &BuildingRepository{db: db}
}

func (r *BuildingRepository) Create(b *models.Building) error {
	return r.db.Create(b).Error
}

func (r *BuildingRepository) FindByBranchID(branchID uint) ([]models.Building, error) {
	var buildings []models.Building
	err := r.db.Where("branch_id = ?", branchID).Order("name asc").Find(&buildings).Error
	return buildings, err
}

func (r *BuildingRepository) FindAll() ([]models.Building, error) {
	var buildings []models.Building
	err := r.db.Preload("Branch").Order("branch_id asc, name asc").Find(&buildings).Error
	return buildings, err
}
