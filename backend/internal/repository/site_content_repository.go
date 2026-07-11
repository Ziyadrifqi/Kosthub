package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SiteContentRepository struct {
	db *gorm.DB
}

func NewSiteContentRepository(db *gorm.DB) *SiteContentRepository {
	return &SiteContentRepository{db: db}
}

func (r *SiteContentRepository) GetAll() ([]models.SiteContent, error) {
	var contents []models.SiteContent
	err := r.db.Order("key asc").Find(&contents).Error
	return contents, err
}

func (r *SiteContentRepository) Upsert(key, value string, userID uuid.UUID) error {
	var content models.SiteContent
	err := r.db.Where("key = ?", key).First(&content).Error

	if err != nil {
		// belum ada, buat baru
		content = models.SiteContent{Key: key, Value: value, UpdatedBy: &userID}
		return r.db.Create(&content).Error
	}

	return r.db.Model(&content).Updates(map[string]interface{}{
		"value":      value,
		"updated_by": userID,
	}).Error
}
