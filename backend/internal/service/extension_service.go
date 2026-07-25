package service

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type ExtensionService struct {
	repo         *repository.ExtensionRepository
	bookingRepo  *repository.BookingRepository
	roomRepo     *repository.RoomRepository
	notifService *NotificationService
}

func NewExtensionService(repo *repository.ExtensionRepository, bookingRepo *repository.BookingRepository, roomRepo *repository.RoomRepository, notifService *NotificationService) *ExtensionService {
	return &ExtensionService{repo: repo, bookingRepo: bookingRepo, roomRepo: roomRepo, notifService: notifService}
}

func (s *ExtensionService) CreateRequest(bookingID uuid.UUID, additionalMonths int) (*models.ExtensionRequest, error) {
	booking, err := s.bookingRepo.FindByID(bookingID)
	if err != nil {
		return nil, err
	}
	if booking.Status != "confirmed" {
		return nil, repository.ErrBookingAlreadyEnded
	}

	endDate := booking.CheckIn.AddDate(0, booking.DurationMonths, 0)
	if time.Now().After(endDate) {
		return nil, repository.ErrBookingAlreadyEnded
	}

	hasPending, err := s.repo.HasPending(bookingID)
	if err != nil {
		return nil, err
	}
	if hasPending {
		return nil, repository.ErrExtensionPending
	}

	room, err := s.roomRepo.FindByID(booking.RoomID)
	if err != nil {
		return nil, err
	}

	pricePerMonth := room.PriceForDuration(additionalMonths)
	totalPrice := pricePerMonth * float64(additionalMonths)

	ext := &models.ExtensionRequest{
		BookingID:        bookingID,
		AdditionalMonths: additionalMonths,
		TotalPrice:       totalPrice,
		Status:           "pending_payment",
	}
	if err := s.repo.Create(ext); err != nil {
		return nil, err
	}
	return ext, nil
}

func (s *ExtensionService) UploadProof(id uuid.UUID, proofURL string) error {
	return s.repo.UploadProof(id, proofURL)
}

func (s *ExtensionService) GetWaiting(branchID *uint) ([]models.ExtensionRequest, error) {
	return s.repo.FindWaitingByBranch(branchID)
}

func (s *ExtensionService) Process(id uuid.UUID, approve bool, adminID uuid.UUID, note string) error {
	ext, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if err := s.repo.ProcessTx(id, approve, adminID, note); err != nil {
		return err
	}

	if approve {
		s.notifService.Notify(ext.Booking.UserID, "Perpanjangan Disetujui",
			"Perpanjangan masa sewamu sudah dikonfirmasi. Terima kasih!", "success")
	} else {
		s.notifService.Notify(ext.Booking.UserID, "Perpanjangan Ditolak",
			"Pengajuan perpanjanganmu ditolak. Silakan hubungi admin lewat live chat.", "error")
	}
	return nil
}
