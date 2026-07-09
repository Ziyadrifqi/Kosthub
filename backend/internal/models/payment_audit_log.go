package models

import (
	"time"

	"github.com/google/uuid"
)

type PaymentAuditLog struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PaymentID   uuid.UUID `json:"payment_id"`
	Action      string    `gorm:"size:20;not null" json:"action"` // verified, rejected
	PerformedBy uuid.UUID `json:"performed_by"`
	Performer   *User     `gorm:"foreignKey:PerformedBy" json:"performer,omitempty"`
	Note        *string   `json:"note"`
	IPAddress   *string   `gorm:"size:50" json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

func (PaymentAuditLog) TableName() string { return "payment_audit_logs" }
