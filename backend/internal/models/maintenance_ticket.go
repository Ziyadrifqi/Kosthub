package models

import (
	"time"

	"github.com/google/uuid"
)

type MaintenanceTicket struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	RoomID      uint       `json:"room_id"`
	Room        *Room      `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	ReportedBy  uuid.UUID  `json:"reported_by"`
	Reporter    *User      `gorm:"foreignKey:ReportedBy" json:"reporter,omitempty"`
	Description string     `gorm:"not null" json:"description"`
	PhotoURL    *string    `json:"photo_url"`
	Status      string     `gorm:"size:20;default:open" json:"status"` // open, in_progress, resolved
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	ResolvedAt  *time.Time `json:"resolved_at"`
}

func (MaintenanceTicket) TableName() string { return "maintenance_tickets" }