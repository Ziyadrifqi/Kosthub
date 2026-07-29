package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type ReviewService struct {
	reviewRepo *repository.ReviewRepository
}

func NewReviewService(reviewRepo *repository.ReviewRepository) *ReviewService {
	return &ReviewService{reviewRepo: reviewRepo}
}

type CreateReviewInput struct {
	UserID  uuid.UUID
	RoomID  uint
	Rating  int
	Comment string
}

func (s *ReviewService) CreateReview(input CreateReviewInput) (*models.Review, error) {
	review := &models.Review{
		UserID:  input.UserID,
		RoomID:  input.RoomID,
		Rating:  input.Rating,
		Comment: input.Comment,
	}
	if err := s.reviewRepo.Create(review); err != nil {
		return nil, err
	}
	return review, nil
}

type RoomReviews struct {
	Reviews []models.Review `json:"reviews"`
	Average float64         `json:"average"`
	Count   int64           `json:"count"`
}

func (s *ReviewService) GetRoomReviews(roomID uint) (*RoomReviews, error) {
	reviews, err := s.reviewRepo.FindByRoomID(roomID)
	if err != nil {
		return nil, err
	}
	avg, count, err := s.reviewRepo.GetAverageRating(roomID)
	if err != nil {
		return nil, err
	}
	return &RoomReviews{Reviews: reviews, Average: avg, Count: count}, nil
}

func (s *ReviewService) CanReview(userID uuid.UUID, roomID uint) (bool, error) {
	hasReviewed, err := s.reviewRepo.UserHasReviewed(userID, roomID)
	if err != nil {
		return false, err
	}
	return !hasReviewed, nil
}

func (s *ReviewService) GetFeatured(limit int) ([]models.Review, error) {
	return s.reviewRepo.FindFeatured(limit)
}

type AdminReviewListOutput struct {
	Reviews []models.Review `json:"reviews"`
	Total   int64           `json:"total"`
}

func (s *ReviewService) GetAllForAdmin(page, limit int) (*AdminReviewListOutput, error) {
	reviews, total, err := s.reviewRepo.FindAllForAdmin(page, limit)
	if err != nil {
		return nil, err
	}
	return &AdminReviewListOutput{Reviews: reviews, Total: total}, nil
}

func (s *ReviewService) ToggleFeatured(id uint) (*models.Review, error) {
	return s.reviewRepo.ToggleFeatured(id)
}
