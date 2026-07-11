package service

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type BookingService struct {
	bookingRepo  *repository.BookingRepository
	roomRepo     *repository.RoomRepository
	notifService *NotificationService
}

func NewBookingService(bookingRepo *repository.BookingRepository, roomRepo *repository.RoomRepository, notifService *NotificationService) *BookingService {
	return &BookingService{bookingRepo: bookingRepo, roomRepo: roomRepo, notifService: notifService}
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

func (s *BookingService) ExpirePendingBookings() (int, error) {
	count, expiredUserIDs, err := s.bookingRepo.ExpirePendingBookingsWithUsers()
	if err != nil {
		return 0, err
	}

	for _, userID := range expiredUserIDs {
		s.notifService.Notify(
			userID,
			"Booking Dibatalkan",
			"Booking kamu otomatis dibatalkan karena tidak ada bukti transfer dalam 24 jam.",
			"warning",
		)
	}

	return count, nil
}
