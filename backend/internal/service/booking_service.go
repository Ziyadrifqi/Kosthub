package service

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type BookingService struct {
	bookingRepo  *repository.BookingRepository
	roomRepo     *repository.RoomRepository
	userRepo     *repository.UserRepository
	roleRepo     *repository.RoleRepository
	notifService *NotificationService
}

func NewBookingService(
	bookingRepo *repository.BookingRepository,
	roomRepo *repository.RoomRepository,
	userRepo *repository.UserRepository,
	roleRepo *repository.RoleRepository,
	notifService *NotificationService,
) *BookingService {
	return &BookingService{
		bookingRepo:  bookingRepo,
		roomRepo:     roomRepo,
		userRepo:     userRepo,
		roleRepo:     roleRepo,
		notifService: notifService,
	}
}

// FindOrCreateCustomer — dipakai staff waktu input booking walk-in.
// Kalau email sudah terdaftar, pakai akun itu. Kalau belum, buat akun baru
// dengan password acak (customer bisa reset password nanti lewat "Lupa Password").
func (s *BookingService) FindOrCreateCustomer(email, name, phone string) (uuid.UUID, error) {
	existing, err := s.userRepo.FindByEmail(email)
	if err == nil {
		return existing.ID, nil
	}

	randomPassword := uuid.New().String()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
	if err != nil {
		return uuid.Nil, err
	}

	customerRole, _ := s.roleRepo.FindByName("customer")

	var phonePtr *string
	if phone != "" {
		phonePtr = &phone
	}

	newUser := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Phone:        phonePtr,
	}
	if customerRole != nil {
		newUser.RoleID = &customerRole.ID
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return uuid.Nil, err
	}

	return newUser.ID, nil
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

	pricePerMonth := room.PriceForDuration(input.DurationMonths)
	totalPrice := pricePerMonth * float64(input.DurationMonths)

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

func (s *BookingService) CompleteExpiredLeases() (int, error) {
	return s.bookingRepo.CompleteExpiredLeases()
}

func (s *BookingService) GetEndingSoon(branchID *uint, days int) ([]models.Booking, error) {
	return s.bookingRepo.FindEndingSoon(branchID, days)
}

type CreateDirectBookingInput struct {
	UserID         uuid.UUID
	RoomID         uint
	CheckIn        time.Time
	DurationMonths int
	CreatedByStaff uuid.UUID
	PaymentNote    string
}

func (s *BookingService) CreateDirectBooking(input CreateDirectBookingInput) (*models.Booking, error) {
	room, err := s.roomRepo.FindByID(input.RoomID)
	if err != nil {
		return nil, err
	}

	totalPrice := room.Price * float64(input.DurationMonths)

	return s.bookingRepo.CreateDirectBookingTx(repository.DirectBookingInput{
		UserID: input.UserID, RoomID: input.RoomID, CheckIn: input.CheckIn,
		DurationMonths: input.DurationMonths, TotalPrice: totalPrice,
		CreatedByStaff: input.CreatedByStaff, PaymentNote: input.PaymentNote,
	})
}

func (s *BookingService) GetUpcomingCheckIns(branchID *uint) ([]models.Booking, error) {
	return s.bookingRepo.FindUpcomingCheckIns(branchID)
}

func (s *BookingService) RescheduleCheckIn(id uuid.UUID, newDate time.Time) error {
	return s.bookingRepo.UpdateCheckInDate(id, newDate)
}

func (s *BookingService) MarkCheckedIn(id uuid.UUID) error {
	return s.bookingRepo.MarkCheckedIn(id)
}
