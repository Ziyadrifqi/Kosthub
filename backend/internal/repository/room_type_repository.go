package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type RoomTypeRepository struct {
	db *gorm.DB
}

func NewRoomTypeRepository(db *gorm.DB) *RoomTypeRepository {
	return &RoomTypeRepository{db: db}
}

func (r *RoomTypeRepository) Create(rt *models.RoomType) error {
	return r.db.Create(rt).Error
}

func (r *RoomTypeRepository) FindAll() ([]models.RoomType, error) {
	var types []models.RoomType
	err := r.db.Order("name asc").Find(&types).Error
	return types, err
}

func (r *RoomTypeRepository) FindByID(id uint) (*models.RoomType, error) {
	var rt models.RoomType
	err := r.db.Where("id = ?", id).First(&rt).Error
	if err != nil {
		return nil, err
	}
	return &rt, nil
}

func (r *RoomTypeRepository) Update(rt *models.RoomType) error {
	return r.db.Save(rt).Error
}

func (r *RoomTypeRepository) SoftDelete(id uint) error {
	return r.db.Delete(&models.RoomType{}, id).Error
}

// CountRoomsUsingType — cegah hapus tipe kamar yang masih dipakai kamar aktif
func (r *RoomTypeRepository) CountRoomsUsingType(typeID uint) (int64, error) {
	var count int64
	err := r.db.Table("rooms").Where("room_type_id = ?", typeID).Count(&count).Error
	return count, err
}
