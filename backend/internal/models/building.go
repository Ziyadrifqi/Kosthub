package models

import "time"

type Building struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	BranchID   uint       `json:"branch_id"`
	Branch     *Branch    `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Name       string     `gorm:"size:150;not null" json:"name"`
	TotalFloor int        `gorm:"default:1" json:"total_floor"`
	Latitude   *float64   `json:"latitude"`
	Longitude  *float64   `json:"longitude"`
	RoomCount  int        `gorm:"-" json:"room_count"`
	DeletedAt  *time.Time `json:"-"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (Building) TableName() string { return "buildings" }
