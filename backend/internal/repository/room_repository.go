package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type RoomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

type RoomFilter struct {
	BranchID uint
	Status   string
	MinPrice float64
	MaxPrice float64
	Page     int
	Limit    int
}

func (r *RoomRepository) FindAll(filter RoomFilter) ([]models.Room, int64, error) {
	rooms := []models.Room{}
	var total int64

	query := r.db.Model(&models.Room{}).
		Preload("Branch").
		Preload("Building").
		Preload("RoomType").
		Preload("Images")

	// filter ini akan memanfaatkan index (branch_id, status, price)
	if filter.BranchID != 0 {
		query = query.Where("branch_id = ?", filter.BranchID)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.MinPrice > 0 {
		query = query.Where("price >= ?", filter.MinPrice)
	}
	if filter.MaxPrice > 0 {
		query = query.Where("price <= ?", filter.MaxPrice)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&rooms).Error; err != nil {
		return nil, 0, err
	}

	return rooms, total, nil
}

func (r *RoomRepository) FindByID(id uint) (*models.Room, error) {
	var room models.Room
	err := r.db.
		Preload("Branch").
		Preload("Building").
		Preload("RoomType").
		Preload("Images").
		Preload("Facilities").
		Where("id = ?", id).
		First(&room).Error
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *RoomRepository) Create(room *models.Room) error {
	return r.db.Create(room).Error
}
