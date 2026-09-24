package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type FacilityService struct {
	repo *repository.FacilityRepository
}

func NewFacilityService(repo *repository.FacilityRepository) *FacilityService {
	return &FacilityService{repo: repo}
}

func (s *FacilityService) Create(name, icon string) (*models.Facility, error) {
	f := &models.Facility{Name: name, Icon: icon}
	if err := s.repo.Create(f); err != nil {
		return nil, err
	}
	return f, nil
}

func (s *FacilityService) GetAll() ([]models.Facility, error) {
	return s.repo.FindAll()
}

func (s *FacilityService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *FacilityService) SetRoomFacilities(roomID uint, facilityIDs []uint) error {
	return s.repo.SetRoomFacilities(roomID, facilityIDs)
}
