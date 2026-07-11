package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type FavoriteService struct {
	favRepo *repository.FavoriteRepository
}

func NewFavoriteService(favRepo *repository.FavoriteRepository) *FavoriteService {
	return &FavoriteService{favRepo: favRepo}
}

func (s *FavoriteService) Toggle(userID uuid.UUID, roomID uint) (bool, error) {
	isFav, err := s.favRepo.IsFavorited(userID, roomID)
	if err != nil {
		return false, err
	}

	if isFav {
		return false, s.favRepo.Remove(userID, roomID)
	}
	return true, s.favRepo.Add(userID, roomID)
}

func (s *FavoriteService) GetMyFavorites(userID uuid.UUID) ([]models.Favorite, error) {
	return s.favRepo.FindByUserID(userID)
}
