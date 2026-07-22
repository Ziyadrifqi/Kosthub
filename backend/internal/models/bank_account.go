package models

import (
	"time"

	"github.com/google/uuid"
)

type BankAccount struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	BankName      string     `gorm:"size:100;not null" json:"bank_name"`
	AccountNumber string     `gorm:"size:50;not null" json:"account_number"`
	AccountHolder string     `gorm:"size:150;not null" json:"account_holder"`
	Note          *string    `json:"note"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	UpdatedBy     *uuid.UUID `json:"updated_by"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (BankAccount) TableName() string { return "bank_accounts" }
