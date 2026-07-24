package models

import "time"

type Branch struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"size:150;not null" json:"name"`
	City      string     `gorm:"size:100" json:"city"`
	Address   string     `json:"address"`
	DeletedAt *time.Time `json:"-"`
	CreatedAt time.Time  `json:"created_at"`
}

func (Branch) TableName() string { return "branches" }
