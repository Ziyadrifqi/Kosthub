package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type MaintenanceService struct {
	repo         *repository.MaintenanceRepository
	notifService *NotificationService
}

func NewMaintenanceService(repo *repository.MaintenanceRepository, notifService *NotificationService) *MaintenanceService {
	return &MaintenanceService{repo: repo, notifService: notifService}
}

type CreateTicketInput struct {
	UserID      uuid.UUID
	RoomID      uint
	Description string
	PhotoURL    *string
}

func (s *MaintenanceService) CreateTicket(input CreateTicketInput) (*models.MaintenanceTicket, error) {
	isTenant, err := s.repo.VerifyTenancy(input.UserID.String(), input.RoomID)
	if err != nil {
		return nil, err
	}
	if !isTenant {
		return nil, repository.ErrNotYourTenancy
	}

	ticket := &models.MaintenanceTicket{
		RoomID: input.RoomID, ReportedBy: input.UserID,
		Description: input.Description, PhotoURL: input.PhotoURL, Status: "open",
	}
	if err := s.repo.Create(ticket); err != nil {
		return nil, err
	}

	room, _ := s.repo.FindByID(ticket.ID)
	if room != nil && room.Room != nil && room.Room.BranchID != 0 {
		s.notifService.NotifyStaffByBranch(room.Room.BranchID, "Laporan Kerusakan Baru",
			"Ada laporan kerusakan kamar yang perlu ditindaklanjuti.", "warning")
	}

	return ticket, nil
}

func (s *MaintenanceService) GetMyTickets(userID string) ([]models.MaintenanceTicket, error) {
	return s.repo.FindByUserID(userID)
}

func (s *MaintenanceService) GetByBranch(branchID *uint, status string) ([]models.MaintenanceTicket, error) {
	return s.repo.FindByBranch(branchID, status)
}

func (s *MaintenanceService) UpdateStatus(id uint, status string) error {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if err := s.repo.UpdateStatus(id, status); err != nil {
		return err
	}

	statusText := map[string]string{
		"in_progress": "sedang ditangani",
		"resolved":    "sudah selesai ditangani",
	}
	if text, ok := statusText[status]; ok {
		s.notifService.Notify(ticket.ReportedBy, "Update Laporan Kerusakan",
			"Laporan kerusakanmu "+text+".", "info")
	}

	return nil
}
