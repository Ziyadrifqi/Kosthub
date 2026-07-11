package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type ChatService struct {
	chatRepo *repository.ChatRepository
}

func NewChatService(chatRepo *repository.ChatRepository) *ChatService {
	return &ChatService{chatRepo: chatRepo}
}

func (s *ChatService) GetOrCreateMyRoom(userID uuid.UUID) (*models.ChatRoom, error) {
	return s.chatRepo.GetOrCreateRoom(userID)
}

func (s *ChatService) GetRoomMessages(roomID uuid.UUID) ([]models.ChatMessage, error) {
	return s.chatRepo.GetMessages(roomID, 100)
}

func (s *ChatService) SaveMessage(msg *models.ChatMessage) error {
	return s.chatRepo.SaveMessage(msg)
}

func (s *ChatService) ListOpenRooms() ([]models.ChatRoom, error) {
	return s.chatRepo.ListOpenRooms()
}

func (s *ChatService) MarkAsRead(roomID, userID uuid.UUID) error {
	return s.chatRepo.MarkMessagesRead(roomID, userID)
}
