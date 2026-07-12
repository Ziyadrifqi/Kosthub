package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type BuildingService struct {
	repo *repository.BuildingRepository
}

func NewBuildingService(repo *repository.BuildingRepository) *BuildingService {
	return &BuildingService{repo: repo}
}

type CreateBuildingInput struct {
	BranchID   uint
	Name       string
	TotalFloor int
}

func (s *BuildingService) Create(input CreateBuildingInput) (*models.Building, error) {
	b := &models.Building{BranchID: input.BranchID, Name: input.Name, TotalFloor: input.TotalFloor}
	if err := s.repo.Create(b); err != nil {
		return nil, err
	}
	return b, nil
}
func (s *BuildingService) GetByID(id uint) (*models.Building, error) {
	return s.repo.FindByID(id)
}

type UpdateBuildingInput struct {
	Name       string
	TotalFloor int
}

func (s *BuildingService) Update(id uint, input UpdateBuildingInput) (*models.Building, error) {
	building, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	building.Name = input.Name
	building.TotalFloor = input.TotalFloor

	if err := s.repo.Update(building); err != nil {
		return nil, err
	}
	return building, nil
}

func (s *BuildingService) Delete(id uint) error {
	return s.repo.SoftDelete(id)
}
func (s *BuildingService) GetByBranch(branchID uint) ([]models.Building, error) {
	return s.repo.FindByBranchID(branchID)
}

func (s *BuildingService) GetAll() ([]models.Building, error) {
	return s.repo.FindAll()
}
