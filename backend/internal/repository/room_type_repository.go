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
