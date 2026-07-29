package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type PaymentService struct {
	paymentRepo  *repository.PaymentRepository
	bookingRepo  *repository.BookingRepository
	notifService *NotificationService
}

func NewPaymentService(paymentRepo *repository.PaymentRepository, bookingRepo *repository.BookingRepository, notifService *NotificationService) *PaymentService {
	return &PaymentService{paymentRepo: paymentRepo, bookingRepo: bookingRepo, notifService: notifService}
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

func (s *PaymentService) VerifyPayment(paymentID uuid.UUID, approve bool, adminID uuid.UUID, note, ipAddress string) error {
	payment, err := s.paymentRepo.FindByID(paymentID)
	if err != nil {
		return err
	}

	if err := s.paymentRepo.VerifyTx(paymentID, approve, adminID, note, ipAddress); err != nil {
		return err
	}

	booking, err := s.bookingRepo.FindByID(payment.BookingID)
	if err == nil && booking != nil {
		if approve {
			s.notifService.Notify(
				booking.UserID,
				"Pembayaran Diverifikasi",
				"Pembayaranmu sudah diverifikasi, booking kamu terkonfirmasi. Selamat!",
				"success",
			)
		} else {
			body := "Pembayaranmu ditolak."
			if note != "" {
				body += " Alasan: " + note
			}
			s.notifService.Notify(booking.UserID, "Pembayaran Ditolak", body, "error")
		}
	}

	return nil
}

func (s *PaymentService) GetAuditLogs(paymentID uuid.UUID) ([]models.PaymentAuditLog, error) {
	return s.paymentRepo.FindAuditLogsByPaymentID(paymentID)
}

type AuditLogListOutput struct {
	Logs  []models.PaymentAuditLog `json:"logs"`
	Total int64                    `json:"total"`
	Page  int                      `json:"page"`
	Limit int                      `json:"limit"`
}

func (s *PaymentService) GetAllAuditLogs(action string, page, limit int) (*AuditLogListOutput, error) {
	logs, total, err := s.paymentRepo.FindAllAuditLogs(repository.AuditLogFilter{
		Action: action, Page: page, Limit: limit,
	})
	if err != nil {
		return nil, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	return &AuditLogListOutput{Logs: logs, Total: total, Page: page, Limit: limit}, nil
}

type TransactionListOutput struct {
	Payments []models.Payment `json:"payments"`
	Total    int64            `json:"total"`
	SumTotal float64          `json:"sum_total"`
	Page     int              `json:"page"`
	Limit    int              `json:"limit"`
}

func (s *PaymentService) GetTransactions(method string, branchID *uint, page, limit int) (*TransactionListOutput, error) {
	result, err := s.paymentRepo.FindVerifiedTransactions(repository.TransactionFilter{
		Method: method, BranchID: branchID, Page: page, Limit: limit,
	})
	if err != nil {
		return nil, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	return &TransactionListOutput{
		Payments: result.Payments, Total: result.Total, SumTotal: result.SumTotal,
		Page: page, Limit: limit,
	}, nil
}
