package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FavoriteRepository struct {
	db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

func (r *FavoriteRepository) Add(userID uuid.UUID, roomID uint) error {
	fav := models.Favorite{UserID: userID, RoomID: roomID}
	return r.db.Clauses(onConflictDoNothing()).Create(&fav).Error
}

func (r *FavoriteRepository) Remove(userID uuid.UUID, roomID uint) error {
	return r.db.Where("user_id = ? AND room_id = ?", userID, roomID).Delete(&models.Favorite{}).Error
}

func (r *FavoriteRepository) IsFavorited(userID uuid.UUID, roomID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.Favorite{}).Where("user_id = ? AND room_id = ?", userID, roomID).Count(&count).Error
	return count > 0, err
}

func (r *FavoriteRepository) FindByUserID(userID uuid.UUID) ([]models.Favorite, error) {
	var favs []models.Favorite
	err := r.db.Preload("Room").Preload("Room.Images").Preload("Room.Branch").
		Where("user_id = ?", userID).Order("created_at desc").Find(&favs).Error
	return favs, err
}
