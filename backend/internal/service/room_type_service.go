package service

import (
	"errors"

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

var ErrRoomTypeInUse = errors.New("tipe kamar ini masih dipakai oleh kamar aktif")

func (s *RoomTypeService) GetByID(id uint) (*models.RoomType, error) {
	return s.repo.FindByID(id)
}

type UpdateRoomTypeInput struct {
	Name        string
	Description string
	BasePrice   float64
}

func (s *RoomTypeService) Update(id uint, input UpdateRoomTypeInput) (*models.RoomType, error) {
	rt, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	rt.Name = input.Name
	rt.Description = input.Description
	rt.BasePrice = input.BasePrice

	if err := s.repo.Update(rt); err != nil {
		return nil, err
	}
	return rt, nil
}

func (s *RoomTypeService) Delete(id uint) error {
	count, err := s.repo.CountRoomsUsingType(id)
	if err != nil {
		return err
	}
	if count > 0 {
		return ErrRoomTypeInUse
	}
	return s.repo.SoftDelete(id)
}
