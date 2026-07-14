package models

import (
	"time"

	"github.com/google/uuid"
)

type ChatRoom struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `json:"user_id"`
	User        *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	BranchID    *uint      `json:"branch_id"`
	Branch      *Branch    `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	AdminID     *uuid.UUID `json:"admin_id"`
	Admin       *User      `gorm:"foreignKey:AdminID" json:"admin,omitempty"`
	Status      string     `gorm:"size:20;default:open" json:"status"`
	UnreadCount int        `gorm:"-" json:"unread_count"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (ChatRoom) TableName() string { return "chat_rooms" }

type ChatMessage struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChatRoomID uuid.UUID `json:"chat_room_id"`
	SenderID   uuid.UUID `json:"sender_id"`
	Sender     *User     `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Message    string    `gorm:"not null" json:"message"`
	IsRead     bool      `gorm:"default:false" json:"is_read"`
	CreatedAt  time.Time `json:"created_at"`
}

func (ChatMessage) TableName() string { return "chat_messages" }
