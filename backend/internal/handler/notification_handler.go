package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	notifService *service.NotificationService
}

func NewNotificationHandler(notifService *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{notifService: notifService}
}

func (h *NotificationHandler) GetMyNotifications(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	page, _ := strconv.Atoi(c.Query("page"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	notifs, total, err := h.notifService.GetMyNotifications(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch notifications"})
		return
	}

	unread, _ := h.notifService.GetUnreadCount(userID)

	c.JSON(http.StatusOK, gin.H{"notifications": notifs, "total": total, "unread_count": unread})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification id"})
		return
	}

	if err := h.notifService.MarkAsRead(uint(id), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "marked as read"})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	if err := h.notifService.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark all as read"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "all marked as read"})
}
