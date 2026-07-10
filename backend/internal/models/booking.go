package models

import (
	"time"

	"github.com/google/uuid"
)

type Booking struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `json:"user_id"`
	User           *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	RoomID         uint       `json:"room_id"`
	Room           *Room      `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	CheckIn        time.Time  `gorm:"type:date;not null" json:"check_in"`
	DurationMonths int        `gorm:"not null" json:"duration_months"`
	TotalPrice     float64    `gorm:"type:numeric(12,2);not null" json:"total_price"`
	Status         string     `gorm:"size:20;default:pending" json:"status"`
	ExpiresAt      *time.Time `json:"expires_at"`
	DeletedAt      *time.Time `json:"-"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (Booking) TableName() string { return "bookings" }
