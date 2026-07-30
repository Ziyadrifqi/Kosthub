package models

import (
	"time"

	"github.com/google/uuid"
)

type TenantProfile struct {
	UserID                uuid.UUID  `gorm:"primaryKey" json:"user_id"`
	IDNumber              *string    `json:"id_number"`
	Address               *string    `json:"address"`
	EmergencyContactName  *string    `json:"emergency_contact_name"`
	EmergencyContactPhone *string    `json:"emergency_contact_phone"`
	Occupation            *string    `json:"occupation"`
	StaffNote             *string    `json:"staff_note"`
	UpdatedBy             *uuid.UUID `json:"updated_by"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

func (TenantProfile) TableName() string { return "tenant_profiles" }
