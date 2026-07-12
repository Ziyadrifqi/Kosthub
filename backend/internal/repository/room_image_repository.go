package repository

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type RoomImageRepository struct {
	db *gorm.DB
}

func NewRoomImageRepository(db *gorm.DB) *RoomImageRepository {
	return &RoomImageRepository{db: db}
}

func (r *RoomImageRepository) Create(img *models.RoomImage) error {
	return r.db.Create(img).Error
}

func (r *RoomImageRepository) FindByRoomID(roomID uint) ([]models.RoomImage, error) {
	var images []models.RoomImage
	err := r.db.Where("room_id = ?", roomID).Order("is_primary desc, created_at asc").Find(&images).Error
	return images, err
}

func (r *RoomImageRepository) FindByID(id uint) (*models.RoomImage, error) {
	var img models.RoomImage
	err := r.db.Where("id = ?", id).First(&img).Error
	if err != nil {
		return nil, err
	}
	return &img, nil
}

func (r *RoomImageRepository) Delete(id uint) error {
	return r.db.Delete(&models.RoomImage{}, id).Error
}

func (r *RoomImageRepository) DeletePhysicalOnly(imageURL string) {
	relativePath := strings.TrimPrefix(imageURL, "/uploads/")
	fullPath := filepath.Join("uploads", relativePath)
	_ = os.Remove(fullPath)
}

// SetPrimary memastikan hanya SATU foto yang jadi primary per kamar —
// unset semua dulu, baru set yang dipilih, dibungkus transaction.
func (r *RoomImageRepository) SetPrimary(roomID, imageID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.RoomImage{}).Where("room_id = ?", roomID).Update("is_primary", false).Error; err != nil {
			return err
		}
		return tx.Model(&models.RoomImage{}).Where("id = ? AND room_id = ?", imageID, roomID).Update("is_primary", true).Error
	})
}
