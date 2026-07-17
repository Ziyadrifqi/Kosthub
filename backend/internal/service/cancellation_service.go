package service

import (
	"errors"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

var (
	ErrBookingNotConfirmed = errors.New("hanya booking yang sudah terkonfirmasi yang bisa diajukan pembatalan")
	ErrInvalidType         = errors.New("tipe pengajuan tidak valid")
)

type CancellationService struct {
	repo         *repository.CancellationRepository
	bookingRepo  *repository.BookingRepository
	notifService *NotificationService
}

func NewCancellationService(repo *repository.CancellationRepository, bookingRepo *repository.BookingRepository, notifService *NotificationService) *CancellationService {
	return &CancellationService{repo: repo, bookingRepo: bookingRepo, notifService: notifService}
}

const (
	FullCancelRefundRate       = 0.85 // customer terima 85%, admin 15%
	EarlyTerminationRefundRate = 0.70 // customer terima 70% dari sisa hari, admin 30%
)

type CreateCancellationInput struct {
	BookingID uuid.UUID
	UserID    uuid.UUID
	Type      string // full_cancel, early_termination
	Reason    string
}

func (s *CancellationService) CalculateRefund(booking *models.Booking, cancellationType string) float64 {
	switch cancellationType {
	case "full_cancel":
		return booking.TotalPrice * FullCancelRefundRate

	case "early_termination":
		endDate := booking.CheckIn.AddDate(0, booking.DurationMonths, 0)
		totalDays := endDate.Sub(booking.CheckIn).Hours() / 24
		if totalDays <= 0 {
			return 0
		}

		elapsedDays := time.Since(booking.CheckIn).Hours() / 24
		if elapsedDays < 0 {
			elapsedDays = 0
		}
		if elapsedDays > totalDays {
			elapsedDays = totalDays
		}

		remainingDays := totalDays - elapsedDays
		dailyRate := booking.TotalPrice / totalDays
		return remainingDays * dailyRate * EarlyTerminationRefundRate

	default:
		return 0
	}
}

func (s *CancellationService) CreateRequest(input CreateCancellationInput) (*models.CancellationRequest, error) {
	if input.Type != "full_cancel" && input.Type != "early_termination" {
		return nil, ErrInvalidType
	}

	booking, err := s.bookingRepo.FindByID(input.BookingID)
	if err != nil {
		return nil, err
	}
	if booking.Status != "confirmed" {
		return nil, ErrBookingNotConfirmed
	}

	refundAmount := s.CalculateRefund(booking, input.Type)

	req := &models.CancellationRequest{
		BookingID:    input.BookingID,
		UserID:       input.UserID,
		Type:         input.Type,
		Reason:       input.Reason,
		RefundAmount: refundAmount,
		Status:       "pending",
	}

	if err := s.repo.Create(req); err != nil {
		return nil, err
	}

	if booking.Room != nil && booking.Room.BranchID != 0 {
		s.notifService.NotifyStaffByBranch(booking.Room.BranchID, "Pengajuan Pembatalan Baru",
			"Ada pengajuan pembatalan booking yang perlu ditinjau.", "warning")
	}

	return req, nil
}

func (s *CancellationService) GetPending(branchID *uint) ([]models.CancellationRequest, error) {
	return s.repo.FindPending(branchID)
}

func (s *CancellationService) Process(id uuid.UUID, approve bool, adminID uuid.UUID, note string) error {
	req, err := s.repo.ProcessTx(id, approve, adminID, note)
	if err != nil {
		return err
	}

	if approve {
		s.notifService.Notify(req.UserID, "Pembatalan Disetujui",
			"Pengajuan pembatalanmu disetujui. Refund akan diproses maksimal 3 hari kerja.", "success")
	} else {
		s.notifService.Notify(req.UserID, "Pembatalan Ditolak",
			"Pengajuan pembatalanmu ditolak. Silakan hubungi admin lewat live chat untuk info lebih lanjut.", "error")
	}

	return nil
}
