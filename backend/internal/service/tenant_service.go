package service

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

var ErrTenantNotInBranch = errors.New("penyewa ini tidak memiliki riwayat booking di cabangmu")

type TenantService struct {
	repo *repository.TenantRepository
}

func NewTenantService(repo *repository.TenantRepository) *TenantService {
	return &TenantService{repo: repo}
}

type TenantListOutput struct {
	Users []models.User `json:"users"`
	Total int64         `json:"total"`
}

func (s *TenantService) GetTenants(branchID *uint, search string, page, limit int) (*TenantListOutput, error) {
	var users []models.User
	var total int64
	var err error

	if branchID != nil {
		users, total, err = s.repo.FindTenantsByBranch(*branchID, search, page, limit)
	} else {
		users, total, err = s.repo.FindTenantsAll(search, page, limit)
	}
	if err != nil {
		return nil, err
	}
	return &TenantListOutput{Users: users, Total: total}, nil
}

type TenantDetailOutput struct {
	Profile *models.TenantProfile `json:"profile"`
	History []models.Booking      `json:"history"`
}

func (s *TenantService) GetTenantDetail(userID uuid.UUID, branchID *uint) (*TenantDetailOutput, error) {
	if branchID != nil {
		inBranch, err := s.repo.VerifyTenantInBranch(userID, *branchID)
		if err != nil {
			return nil, err
		}
		if !inBranch {
			return nil, ErrTenantNotInBranch
		}
	}

	profile, _ := s.repo.FindProfile(userID) // wajar kalau belum ada, nil saja

	var history []models.Booking
	var err error
	if branchID != nil {
		history, err = s.repo.FindBookingHistoryInBranch(userID, *branchID)
		if err != nil {
			return nil, err
		}
	}

	return &TenantDetailOutput{Profile: profile, History: history}, nil
}

type UpdateProfileInput struct {
	IDNumber              string
	Address               string
	EmergencyContactName  string
	EmergencyContactPhone string
	Occupation            string
	StaffNote             string
}

func (s *TenantService) UpdateProfile(userID uuid.UUID, input UpdateProfileInput, updatedBy uuid.UUID) error {
	profile := &models.TenantProfile{
		UserID:                userID,
		IDNumber:              strPtr(input.IDNumber),
		Address:               strPtr(input.Address),
		EmergencyContactName:  strPtr(input.EmergencyContactName),
		EmergencyContactPhone: strPtr(input.EmergencyContactPhone),
		Occupation:            strPtr(input.Occupation),
		StaffNote:             strPtr(input.StaffNote),
		UpdatedBy:             &updatedBy,
	}
	return s.repo.UpsertProfile(profile)
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
