package models

import (
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID       uuid.UUID  `json:"booking_id"`
	Booking         *Booking   `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	Method          string     `gorm:"size:30;not null" json:"method"` // manual_transfer, midtrans
	ProofURL        *string    `json:"proof_url"`
	MidtransOrderID *string    `gorm:"size:100" json:"midtrans_order_id"`
	Amount          float64    `gorm:"type:numeric(12,2);not null" json:"amount"`
	Status          string     `gorm:"size:20;default:waiting_verification" json:"status"` // waiting_verification, verified, rejected, paid
	VerifiedBy      *uuid.UUID `json:"verified_by"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (Payment) TableName() string { return "payments" }
