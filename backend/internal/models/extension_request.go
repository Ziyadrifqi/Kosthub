package models

import (
	"time"

	"github.com/google/uuid"
)

type ExtensionRequest struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID        uuid.UUID  `json:"booking_id"`
	Booking          *Booking   `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	AdditionalMonths int        `json:"additional_months"`
	TotalPrice       float64    `gorm:"type:numeric(12,2);not null" json:"total_price"`
	ProofURL         *string    `json:"proof_url"`
	Status           string     `gorm:"size:20;default:pending_payment" json:"status"`
	VerifiedBy       *uuid.UUID `json:"verified_by"`
	Verifier         *User      `gorm:"foreignKey:VerifiedBy" json:"verifier,omitempty"`
	AdminNote        *string    `json:"admin_note"`
	CreatedAt        time.Time  `json:"created_at"`
	VerifiedAt       *time.Time `json:"verified_at"`
}

func (ExtensionRequest) TableName() string { return "extension_requests" }
