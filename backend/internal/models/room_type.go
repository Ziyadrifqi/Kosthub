package models

import "time"

type RoomType struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"size:100;not null" json:"name"`
	Description string     `json:"description"`
	BasePrice   float64    `gorm:"type:numeric(12,2);not null" json:"base_price"`
	RoomCount   int        `gorm:"-" json:"room_count"`
	DeletedAt   *time.Time `json:"-"`
}

func (RoomType) TableName() string { return "room_types" }
