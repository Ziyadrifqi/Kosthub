package repository

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var ErrReviewRequiresCompletedBooking = errors.New("you can only review a room after completing a stay")

type ReviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

// Create memastikan user pernah booking (status confirmed/completed) kamar ini
// sebelum boleh review — mencegah review palsu dari orang yang tidak pernah menyewa.
func (r *ReviewRepository) Create(review *models.Review) error {
	var count int64
	r.db.Model(&models.Booking{}).
		Where("user_id = ? AND room_id = ? AND status IN ?", review.UserID, review.RoomID, []string{"confirmed", "completed"}).
		Count(&count)

	if count == 0 {
		return ErrReviewRequiresCompletedBooking
	}

	return r.db.Create(review).Error
}

func (r *ReviewRepository) FindByRoomID(roomID uint) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Preload("User").Where("room_id = ?", roomID).Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func (r *ReviewRepository) GetAverageRating(roomID uint) (float64, int64, error) {
	var result struct {
		Avg   float64
		Count int64
	}
	err := r.db.Model(&models.Review{}).
		Select("COALESCE(AVG(rating), 0) as avg, COUNT(*) as count").
		Where("room_id = ?", roomID).
		Scan(&result).Error
	return result.Avg, result.Count, err
}

func (r *ReviewRepository) UserHasReviewed(userID uuid.UUID, roomID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.Review{}).Where("user_id = ? AND room_id = ?", userID, roomID).Count(&count).Error
	return count > 0, err
}

func (r *ReviewRepository) FindFeatured(limit int) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Preload("User").Preload("Room").
		Where("is_featured = ?", true).
		Order("created_at desc").
		Limit(limit).
		Find(&reviews).Error
	return reviews, err
}

func (r *ReviewRepository) FindAllForAdmin(page, limit int) ([]models.Review, int64, error) {
	var reviews []models.Review
	var total int64

	query := r.db.Model(&models.Review{}).Preload("User").Preload("Room")

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&reviews).Error; err != nil {
		return nil, 0, err
	}
	return reviews, total, nil
}

func (r *ReviewRepository) ToggleFeatured(id uint) (*models.Review, error) {
	var review models.Review
	if err := r.db.Where("id = ?", id).First(&review).Error; err != nil {
		return nil, err
	}
	review.IsFeatured = !review.IsFeatured
	if err := r.db.Save(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}
