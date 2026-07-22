package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type BankAccountService struct {
	repo *repository.BankAccountRepository
}

func NewBankAccountService(repo *repository.BankAccountRepository) *BankAccountService {
	return &BankAccountService{repo: repo}
}

type BankAccountInput struct {
	BankName      string
	AccountNumber string
	AccountHolder string
	Note          string
}

func (s *BankAccountService) Create(input BankAccountInput, userID uuid.UUID) (*models.BankAccount, error) {
	var notePtr *string
	if input.Note != "" {
		notePtr = &input.Note
	}
	acc := &models.BankAccount{
		BankName: input.BankName, AccountNumber: input.AccountNumber,
		AccountHolder: input.AccountHolder, Note: notePtr, IsActive: true, UpdatedBy: &userID,
	}
	if err := s.repo.Create(acc); err != nil {
		return nil, err
	}
	return acc, nil
}

func (s *BankAccountService) GetActive() ([]models.BankAccount, error) {
	return s.repo.FindActive()
}

func (s *BankAccountService) GetAll() ([]models.BankAccount, error) {
	return s.repo.FindAll()
}

func (s *BankAccountService) Update(id uint, input BankAccountInput, userID uuid.UUID) (*models.BankAccount, error) {
	acc, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	acc.BankName = input.BankName
	acc.AccountNumber = input.AccountNumber
	acc.AccountHolder = input.AccountHolder
	if input.Note != "" {
		acc.Note = &input.Note
	} else {
		acc.Note = nil
	}
	acc.UpdatedBy = &userID

	if err := s.repo.Update(acc); err != nil {
		return nil, err
	}
	return acc, nil
}

func (s *BankAccountService) ToggleActive(id uint, userID uuid.UUID) (*models.BankAccount, error) {
	acc, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	acc.IsActive = !acc.IsActive
	acc.UpdatedBy = &userID
	if err := s.repo.Update(acc); err != nil {
		return nil, err
	}
	return acc, nil
}

func (s *BankAccountService) Delete(id uint) error {
	return s.repo.Delete(id)
}
