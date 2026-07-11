package models

import (
	"time"

	"github.com/google/uuid"
)

type SiteContent struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Key       string     `gorm:"size:100;unique;not null" json:"key"`
	Value     string     `json:"value"`
	UpdatedBy *uuid.UUID `json:"updated_by"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (SiteContent) TableName() string { return "site_contents" }
