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
