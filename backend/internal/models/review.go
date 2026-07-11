package models

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	RoomID    uint      `json:"room_id"`
	Rating    int       `gorm:"not null" json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

func (Review) TableName() string { return "reviews" }
