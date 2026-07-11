package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

// GetOrCreateRoom — customer selalu dapat 1 room yang sama selama masih 'open'
func (r *ChatRepository) GetOrCreateRoom(userID uuid.UUID) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.Where("user_id = ? AND status = ?", userID, "open").First(&room).Error
	if err == nil {
		return &room, nil
	}

	room = models.ChatRoom{UserID: userID, Status: "open"}
	if err := r.db.Create(&room).Error; err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *ChatRepository) FindRoomByID(id uuid.UUID) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.Preload("User").Preload("Admin").Where("id = ?", id).First(&room).Error
	if err != nil {
		return nil, err
	}
	return &room, nil
}

// ListOpenRooms — untuk sisi admin, lihat semua percakapan aktif
func (r *ChatRepository) ListOpenRooms() ([]models.ChatRoom, error) {
	var rooms []models.ChatRoom
	err := r.db.Preload("User").Where("status = ?", "open").Order("created_at desc").Find(&rooms).Error
	return rooms, err
}

func (r *ChatRepository) SaveMessage(msg *models.ChatMessage) error {
	return r.db.Create(msg).Error
}

func (r *ChatRepository) GetMessages(roomID uuid.UUID, limit int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	// memanfaatkan index (chat_room_id, created_at)
	err := r.db.Preload("Sender").
		Where("chat_room_id = ?", roomID).
		Order("created_at asc").
		Limit(limit).
		Find(&messages).Error
	return messages, err
}

func (r *ChatRepository) MarkMessagesRead(roomID uuid.UUID, notSenderID uuid.UUID) error {
	return r.db.Model(&models.ChatMessage{}).
		Where("chat_room_id = ? AND sender_id != ? AND is_read = ?", roomID, notSenderID, false).
		Update("is_read", true).Error
}
