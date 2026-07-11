package models

import (
	"time"

	"github.com/google/uuid"
)

type Favorite struct {
	UserID    uuid.UUID `gorm:"primaryKey" json:"user_id"`
	RoomID    uint      `gorm:"primaryKey" json:"room_id"`
	Room      *Room     `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

func (Favorite) TableName() string { return "favorites" }
