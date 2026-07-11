package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FavoriteHandler struct {
	favService *service.FavoriteService
}

func NewFavoriteHandler(favService *service.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{favService: favService}
}

func (h *FavoriteHandler) Toggle(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	roomID, err := strconv.Atoi(c.Param("roomId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	isFavorited, err := h.favService.Toggle(userID, uint(roomID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_favorited": isFavorited})
}

func (h *FavoriteHandler) GetMyFavorites(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))
	favs, err := h.favService.GetMyFavorites(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch favorites"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"favorites": favs})
}
