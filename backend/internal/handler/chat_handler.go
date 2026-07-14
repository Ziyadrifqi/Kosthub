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

type setBranchRequest struct {
	BranchID uint `json:"branch_id" binding:"required"`
}

// PATCH /api/chat/my-room/branch — dipakai guest yang belum punya booking,
// buat pilih manual cabang mana yang mau ditanyakan
func (h *ChatHandler) SetMyRoomBranch(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	room, err := h.chatService.GetOrCreateMyRoom(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chat room"})
		return
	}

	var req setBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.chatService.SetRoomBranch(room.ID, userID, req.BranchID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set branch"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "branch updated"})
}

// GET /api/staff/chat/rooms — cuma nampilin chat dari cabang staff yang login
func (h *ChatHandler) ListOpenRooms(c *gin.Context) {
	branchIDRaw := c.MustGet("branch_id")
	if branchIDRaw == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "akunmu belum di-assign ke cabang manapun"})
		return
	}
	branchID := uint(branchIDRaw.(float64))

	rooms, err := h.chatService.ListOpenRoomsByBranch(branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch chat rooms"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"rooms": rooms})
}
