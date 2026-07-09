package service

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type BookingService struct {
	bookingRepo *repository.BookingRepository
	roomRepo    *repository.RoomRepository
}

func NewBookingService(bookingRepo *repository.BookingRepository, roomRepo *repository.RoomRepository) *BookingService {
	return &BookingService{bookingRepo: bookingRepo, roomRepo: roomRepo}
}

type CreateBookingInput struct {
	UserID         uuid.UUID
	RoomID         uint
	CheckIn        time.Time
	DurationMonths int
}

func (s *BookingService) CreateBooking(input CreateBookingInput) (*models.Booking, error) {
	room, err := s.roomRepo.FindByID(input.RoomID)
	if err != nil {
		return nil, err
	}

	totalPrice := room.Price * float64(input.DurationMonths)

	booking := &models.Booking{
		UserID:         input.UserID,
		RoomID:         input.RoomID,
		CheckIn:        input.CheckIn,
		DurationMonths: input.DurationMonths,
		TotalPrice:     totalPrice,
		Status:         "pending",
	}

	if err := s.bookingRepo.CreateBookingTx(booking); err != nil {
		return nil, err
	}

	return booking, nil
}

func (s *BookingService) GetMyBookings(userID uuid.UUID, page, limit int) ([]models.Booking, int64, error) {
	return s.bookingRepo.FindByUserID(userID, page, limit)
}

func (s *BookingService) GetBookingByID(id uuid.UUID) (*models.Booking, error) {
	return s.bookingRepo.FindByID(id)
}
