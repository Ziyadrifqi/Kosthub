package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChatHandler struct {
	chatService *service.ChatService
}

func NewChatHandler(chatService *service.ChatService) *ChatHandler {
	return &ChatHandler{chatService: chatService}
}

// GET /api/chat/my-room — customer dapat room miliknya (atau dibuatkan baru)
func (h *ChatHandler) GetMyRoom(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	room, err := h.chatService.GetOrCreateMyRoom(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chat room"})
		return
	}
	c.JSON(http.StatusOK, room)
}

// GET /api/chat/:roomId/messages
func (h *ChatHandler) GetMessages(c *gin.Context) {
	roomID, err := uuid.Parse(c.Param("roomId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	messages, err := h.chatService.GetRoomMessages(roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch messages"})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	h.chatService.MarkAsRead(roomID, userID)

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

// GET /api/admin/chat/rooms — daftar semua percakapan aktif (untuk admin)
func (h *ChatHandler) ListOpenRooms(c *gin.Context) {
	rooms, err := h.chatService.ListOpenRooms()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch chat rooms"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rooms": rooms})
}
