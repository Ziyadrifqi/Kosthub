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
func (r *BuildingRepository) FindByID(id uint) (*models.Building, error) {
	var building models.Building
	err := r.db.Preload("Branch").Where("id = ?", id).First(&building).Error
	if err != nil {
		return nil, err
	}
	return &building, nil
}

func (r *BuildingRepository) Update(b *models.Building) error {
	return r.db.Save(b).Error
}

func (r *BuildingRepository) SoftDelete(id uint) error {
	return r.db.Delete(&models.Building{}, id).Error
}
func (r *BuildingRepository) FindByBranchID(branchID uint) ([]models.Building, error) {
	var buildings []models.Building
	err := r.db.Preload("Branch").Where("branch_id = ?", branchID).Order("name asc").Find(&buildings).Error
	if err != nil {
		return nil, err
	}
	r.attachRoomCounts(buildings)
	return buildings, nil
}

func (r *BuildingRepository) FindAll() ([]models.Building, error) {
	var buildings []models.Building
	err := r.db.Preload("Branch").Order("branch_id asc, name asc").Find(&buildings).Error
	if err != nil {
		return nil, err
	}
	r.attachRoomCounts(buildings)
	return buildings, nil
}

// attachRoomCounts mengisi field RoomCount tiap building dengan menghitung
// jumlah kamar (rooms) yang terhubung ke building_id tersebut.
func (r *BuildingRepository) attachRoomCounts(buildings []models.Building) {
	for i := range buildings {
		var count int64
		r.db.Model(&models.Room{}).Where("building_id = ?", buildings[i].ID).Count(&count)
		buildings[i].RoomCount = int(count)
	}
}
