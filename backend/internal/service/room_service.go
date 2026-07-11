package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type RoomService struct {
	roomRepo *repository.RoomRepository
}

func NewRoomService(roomRepo *repository.RoomRepository) *RoomService {
	return &RoomService{roomRepo: roomRepo}
}

type ListRoomsInput struct {
	BranchID uint
	Status   string
	MinPrice float64
	MaxPrice float64
	Search   string
	Page     int
	Limit    int
}

type ListRoomsOutput struct {
	Rooms []models.Room `json:"rooms"`
	Total int64         `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

func (s *RoomService) ListRooms(input ListRoomsInput) (*ListRoomsOutput, error) {
	rooms, total, err := s.roomRepo.FindAll(repository.RoomFilter{
		BranchID: input.BranchID,
		Status:   input.Status,
		MinPrice: input.MinPrice,
		MaxPrice: input.MaxPrice,
		Page:     input.Page,
		Limit:    input.Limit,
		Search:   input.Search,
	})
	if err != nil {
		return nil, err
	}

	page := input.Page
	if page < 1 {
		page = 1
	}
	limit := input.Limit
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return &ListRoomsOutput{
		Rooms: rooms,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

func (s *RoomService) GetRoomByID(id uint) (*models.Room, error) {
	return s.roomRepo.FindByID(id)
}

type CreateRoomInput struct {
	BranchID   uint
	BuildingID uint
	RoomTypeID uint
	RoomNumber string
	Price      float64
}

func (s *RoomService) CreateRoom(input CreateRoomInput) (*models.Room, error) {
	room := &models.Room{
		BranchID:   input.BranchID,
		BuildingID: input.BuildingID,
		RoomTypeID: input.RoomTypeID,
		RoomNumber: input.RoomNumber,
		Price:      input.Price,
		Status:     "available",
	}
	if err := s.roomRepo.Create(room); err != nil {
		return nil, err
	}
	return room, nil
}
