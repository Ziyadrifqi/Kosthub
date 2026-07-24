package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type BranchRepository struct {
	db *gorm.DB
}

func NewBranchRepository(db *gorm.DB) *BranchRepository {
	return &BranchRepository{db: db}
}

func (r *BranchRepository) Create(b *models.Branch) error {
	return r.db.Create(b).Error
}

func (r *BranchRepository) FindAll() ([]models.Branch, error) {
	var branches []models.Branch
	err := r.db.Order("name asc").Find(&branches).Error
	return branches, err
}

func (r *BranchRepository) FindByID(id uint) (*models.Branch, error) {
	var b models.Branch
	err := r.db.Where("id = ?", id).First(&b).Error
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *BranchRepository) Update(b *models.Branch) error {
	return r.db.Save(b).Error
}

func (r *BranchRepository) Delete(id uint) error {
	return r.db.Delete(&models.Branch{}, id).Error
}

// CountDependents — cegah hapus cabang yang masih punya gedung/kamar/staff
func (r *BranchRepository) CountDependents(id uint) (int64, error) {
	var count int64
	err := r.db.Table("buildings").Where("branch_id = ?", id).Count(&count).Error
	return count, err
}
