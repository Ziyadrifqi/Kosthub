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

// findLatestBranchByUser cek booking terakhir user (status apa saja) buat
// nebak cabang mana yang relevan — supaya chat otomatis "nyambung" ke cabang yang benar.
func (r *ChatRepository) findLatestBranchByUser(userID uuid.UUID) (*uint, error) {
	var booking models.Booking
	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at desc").
		First(&booking).Error
	if err != nil {
		return nil, nil // wajar kalau belum pernah booking, bukan error
	}

	var room models.Room
	if err := r.db.Select("branch_id").First(&room, booking.RoomID).Error; err != nil {
		return nil, nil
	}
	return &room.BranchID, nil
}

func (r *ChatRepository) GetOrCreateRoom(userID uuid.UUID) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.Preload("Branch").Where("user_id = ? AND status = ?", userID, "open").First(&room).Error
	if err == nil {
		return &room, nil
	}

	branchID, _ := r.findLatestBranchByUser(userID)

	room = models.ChatRoom{UserID: userID, Status: "open", BranchID: branchID}
	if err := r.db.Create(&room).Error; err != nil {
		return nil, err
	}
	r.db.Preload("Branch").First(&room, room.ID)
	return &room, nil
}

func (r *ChatRepository) SetRoomBranch(roomID uuid.UUID, userID uuid.UUID, branchID uint) error {
	return r.db.Model(&models.ChatRoom{}).
		Where("id = ? AND user_id = ?", roomID, userID).
		Update("branch_id", branchID).Error
}

func (r *ChatRepository) FindRoomByID(id uuid.UUID) (*models.ChatRoom, error) {
	var room models.ChatRoom
	err := r.db.Preload("User").Preload("Branch").Where("id = ?", id).First(&room).Error
	if err != nil {
		return nil, err
	}
	return &room, nil
}

// ListOpenRoomsByBranch — staff cuma lihat chat dari cabangnya sendiri,
// sekalian hitung pesan yang belum dibaca dari customer (bukan dari staff sendiri)
func (r *ChatRepository) ListOpenRoomsByBranch(branchID uint) ([]models.ChatRoom, error) {
	var rooms []models.ChatRoom
	err := r.db.Preload("User").Preload("Branch").
		Where("status = ? AND branch_id = ?", "open", branchID).
		Order("created_at desc").Find(&rooms).Error
	if err != nil {
		return nil, err
	}

	for i := range rooms {
		var count int64
		r.db.Model(&models.ChatMessage{}).
			Where("chat_room_id = ? AND sender_id = ? AND is_read = ?", rooms[i].ID, rooms[i].UserID, false).
			Count(&count)
		rooms[i].UnreadCount = int(count)
	}

	return rooms, nil
}

func (r *ChatRepository) SaveMessage(msg *models.ChatMessage) error {
	return r.db.Create(msg).Error
}

func (r *ChatRepository) GetMessages(roomID uuid.UUID, limit int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
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
