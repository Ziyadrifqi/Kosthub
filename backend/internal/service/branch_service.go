package service

import (
	"errors"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

var ErrBranchInUse = errors.New("cabang ini masih memiliki gedung, tidak bisa dihapus")

type BranchService struct {
	repo *repository.BranchRepository
}

func NewBranchService(repo *repository.BranchRepository) *BranchService {
	return &BranchService{repo: repo}
}

type BranchInput struct {
	Name    string
	City    string
	Address string
}

func (s *BranchService) Create(input BranchInput) (*models.Branch, error) {
	b := &models.Branch{Name: input.Name, City: input.City, Address: input.Address}
	if err := s.repo.Create(b); err != nil {
		return nil, err
	}
	return b, nil
}

func (s *BranchService) GetAll() ([]models.Branch, error) {
	return s.repo.FindAll()
}

func (s *BranchService) Update(id uint, input BranchInput) (*models.Branch, error) {
	b, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	b.Name = input.Name
	b.City = input.City
	b.Address = input.Address
	if err := s.repo.Update(b); err != nil {
		return nil, err
	}
	return b, nil
}

func (s *BranchService) Delete(id uint) error {
	count, err := s.repo.CountDependents(id)
	if err != nil {
		return err
	}
	if count > 0 {
		return ErrBranchInUse
	}
	return s.repo.Delete(id)
}
