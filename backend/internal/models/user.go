package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	RoleID       *uint      `json:"role_id"`
	Role         *Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Name         string     `gorm:"size:150;not null" json:"name"`
	Email        string     `gorm:"size:150;not null;uniqueIndex" json:"email"`
	PasswordHash string     `gorm:"size:255;not null" json:"-"`
	Phone        *string    `gorm:"size:30" json:"phone"`
	AvatarURL    *string    `json:"avatar_url"`
	DeletedAt    *time.Time `json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
