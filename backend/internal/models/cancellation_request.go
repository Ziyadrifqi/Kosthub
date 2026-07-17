package models

import (
	"time"

	"github.com/google/uuid"
)

type CancellationRequest struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID    uuid.UUID  `json:"booking_id"`
	Booking      *Booking   `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	UserID       uuid.UUID  `json:"user_id"`
	User         *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Type         string     `gorm:"size:20;not null" json:"type"` // full_cancel, early_termination
	Reason       string     `json:"reason"`
	RefundAmount float64    `gorm:"type:numeric(12,2);not null" json:"refund_amount"`
	Status       string     `gorm:"size:20;default:pending" json:"status"`
	ProcessedBy  *uuid.UUID `json:"processed_by"`
	Processor    *User      `gorm:"foreignKey:ProcessedBy" json:"processor,omitempty"`
	AdminNote    *string    `json:"admin_note"`
	CreatedAt    time.Time  `json:"created_at"`
	ProcessedAt  *time.Time `json:"processed_at"`
}

func (CancellationRequest) TableName() string { return "cancellation_requests" }
