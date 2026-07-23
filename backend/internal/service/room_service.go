package service

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type RoomService struct {
	roomRepo      *repository.RoomRepository
	roomImageRepo *repository.RoomImageRepository
}

func NewRoomService(roomRepo *repository.RoomRepository, roomImageRepo *repository.RoomImageRepository) *RoomService {
	return &RoomService{roomRepo: roomRepo, roomImageRepo: roomImageRepo}
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

type UpdateRoomInput struct {
	RoomNumber        string
	Price             float64
	Status            string
	DiscountType      *string
	DiscountValue     *float64
	DiscountStartDate *time.Time
	DiscountEndDate   *time.Time
	DiscountMinMonths *int
}

func (s *RoomService) UpdateRoom(id uint, input UpdateRoomInput) (*models.Room, error) {
	room, err := s.roomRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	room.RoomNumber = input.RoomNumber
	room.Price = input.Price
	room.Status = input.Status
	room.DiscountType = input.DiscountType
	room.DiscountValue = input.DiscountValue
	room.DiscountStartDate = input.DiscountStartDate
	room.DiscountEndDate = input.DiscountEndDate
	room.DiscountMinMonths = input.DiscountMinMonths

	if err := s.roomRepo.Update(room); err != nil {
		return nil, err
	}

	room.CalculateFinalPrice()
	return room, nil
}

func (s *RoomService) DeleteRoom(id uint) error {
	// hapus semua foto fisik terkait dulu sebelum kamar dihapus
	images, err := s.roomImageRepo.FindByRoomID(id)
	if err == nil {
		for _, img := range images {
			s.roomImageRepo.DeletePhysicalOnly(img.ImageURL)
		}
	}
	return s.roomRepo.SoftDelete(id)
}
