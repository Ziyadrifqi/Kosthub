package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type PaymentService struct {
	paymentRepo *repository.PaymentRepository
	bookingRepo *repository.BookingRepository
}

func NewPaymentService(paymentRepo *repository.PaymentRepository, bookingRepo *repository.BookingRepository) *PaymentService {
	return &PaymentService{paymentRepo: paymentRepo, bookingRepo: bookingRepo}
}

type UploadProofInput struct {
	BookingID uuid.UUID
	ProofURL  string
}

func (s *PaymentService) UploadProof(input UploadProofInput) (*models.Payment, error) {
	booking, err := s.bookingRepo.FindByID(input.BookingID)
	if err != nil {
		return nil, err
	}

	payment := &models.Payment{
		BookingID: input.BookingID,
		Method:    "manual_transfer",
		ProofURL:  &input.ProofURL,
		Amount:    booking.TotalPrice,
		Status:    "waiting_verification",
	}

	if err := s.paymentRepo.Create(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

func (s *PaymentService) GetPendingPayments(page, limit int) ([]models.Payment, int64, error) {
	return s.paymentRepo.FindPending(page, limit)
}

func (s *PaymentService) VerifyPayment(paymentID uuid.UUID, approve bool, adminID uuid.UUID) error {
	return s.paymentRepo.VerifyTx(paymentID, approve, adminID)
}
