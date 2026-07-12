package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type RoomImageHandler struct {
	imageService *service.RoomImageService
}

func NewRoomImageHandler(imageService *service.RoomImageService) *RoomImageHandler {
	return &RoomImageHandler{imageService: imageService}
}

// staff hanya boleh kelola foto kamar di cabangnya sendiri
func (h *RoomImageHandler) checkBranchAccess(c *gin.Context, roomID uint) bool {
	role := c.MustGet("role").(string)
	if role != "staff" {
		return true
	}
	branchID, err := h.imageService.GetRoomBranch(roomID)
	if err != nil {
		return false
	}
	userBranchID := c.MustGet("branch_id")
	return userBranchID != nil && uint(userBranchID.(float64)) == branchID
}

// POST /api/staff/rooms/:id/images
func (h *RoomImageHandler) Upload(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	if !h.checkBranchAccess(c, uint(roomID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "kamu hanya bisa mengelola foto kamar di cabangmu sendiri"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file 'image' wajib diisi"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("room_%d_%d%s", roomID, time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", "rooms", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	img, err := h.imageService.Upload(uint(roomID), "/uploads/rooms/"+filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image record"})
		return
	}

	c.JSON(http.StatusCreated, img)
}

// GET /api/staff/rooms/:id/images
func (h *RoomImageHandler) List(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	images, err := h.imageService.GetByRoomID(uint(roomID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"images": images})
}

// DELETE /api/staff/rooms/:id/images/:imageId
func (h *RoomImageHandler) Delete(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}
	imageID, err := strconv.Atoi(c.Param("imageId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid image id"})
		return
	}

	if !h.checkBranchAccess(c, uint(roomID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "akses ditolak"})
		return
	}

	if err := h.imageService.Delete(uint(imageID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "image deleted"})
}

// PATCH /api/staff/rooms/:id/images/:imageId/primary
func (h *RoomImageHandler) SetPrimary(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}
	imageID, err := strconv.Atoi(c.Param("imageId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid image id"})
		return
	}

	if !h.checkBranchAccess(c, uint(roomID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "akses ditolak"})
		return
	}

	if err := h.imageService.SetPrimary(uint(roomID), uint(imageID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set primary image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "primary image updated"})
}
