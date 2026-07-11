package models

import (
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Title     string    `gorm:"size:150" json:"title"`
	Body      string    `json:"body"`
	Type      string    `gorm:"size:30;default:info" json:"type"` // info, success, warning, error
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (Notification) TableName() string { return "notifications" }
