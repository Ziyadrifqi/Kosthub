package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type BankAccountRepository struct {
	db *gorm.DB
}

func NewBankAccountRepository(db *gorm.DB) *BankAccountRepository {
	return &BankAccountRepository{db: db}
}

func (r *BankAccountRepository) Create(b *models.BankAccount) error {
	return r.db.Create(b).Error
}

// FindActive — dipakai halaman publik/customer, cuma yang aktif
func (r *BankAccountRepository) FindActive() ([]models.BankAccount, error) {
	var accounts []models.BankAccount
	err := r.db.Where("is_active = ?", true).Order("created_at asc").Find(&accounts).Error
	return accounts, err
}

// FindAll — dipakai owner, termasuk yang nonaktif, biar bisa diaktifkan lagi kalau perlu
func (r *BankAccountRepository) FindAll() ([]models.BankAccount, error) {
	var accounts []models.BankAccount
	err := r.db.Order("created_at asc").Find(&accounts).Error
	return accounts, err
}

func (r *BankAccountRepository) FindByID(id uint) (*models.BankAccount, error) {
	var acc models.BankAccount
	err := r.db.Where("id = ?", id).First(&acc).Error
	if err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *BankAccountRepository) Update(b *models.BankAccount) error {
	return r.db.Save(b).Error
}

func (r *BankAccountRepository) Delete(id uint) error {
	return r.db.Delete(&models.BankAccount{}, id).Error
}
