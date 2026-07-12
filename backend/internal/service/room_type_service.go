package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type RoomTypeService struct {
	repo *repository.RoomTypeRepository
}

func NewRoomTypeService(repo *repository.RoomTypeRepository) *RoomTypeService {
	return &RoomTypeService{repo: repo}
}

type CreateRoomTypeInput struct {
	Name        string
	Description string
	BasePrice   float64
}

func (s *RoomTypeService) Create(input CreateRoomTypeInput) (*models.RoomType, error) {
	rt := &models.RoomType{Name: input.Name, Description: input.Description, BasePrice: input.BasePrice}
	if err := s.repo.Create(rt); err != nil {
		return nil, err
	}
	return rt, nil
}

func (s *RoomTypeService) GetAll() ([]models.RoomType, error) {
	return s.repo.FindAll()
}
