package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MaintenanceHandler struct {
	service *service.MaintenanceService
}

func NewMaintenanceHandler(s *service.MaintenanceService) *MaintenanceHandler {
	return &MaintenanceHandler{service: s}
}

// POST /api/maintenance-tickets — multipart, foto opsional
func (h *MaintenanceHandler) Create(c *gin.Context) {
	roomID, err := strconv.Atoi(c.PostForm("room_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id tidak valid"})
		return
	}
	description := c.PostForm("description")
	if description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "deskripsi wajib diisi"})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	var photoURL *string
	if file, err := c.FormFile("photo"); err == nil {
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("maintenance_%d%s", time.Now().UnixNano(), ext)
		savePath := filepath.Join("uploads", "maintenance", filename)
		if err := c.SaveUploadedFile(file, savePath); err == nil {
			url := "/uploads/maintenance/" + filename
			photoURL = &url
		}
	}

	ticket, err := h.service.CreateTicket(service.CreateTicketInput{
		UserID: userID, RoomID: uint(roomID), Description: description, PhotoURL: photoURL,
	})
	if err != nil {
		if err == repository.ErrNotYourTenancy {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat laporan"})
		return
	}

	c.JSON(http.StatusCreated, ticket)
}

// GET /api/maintenance-tickets/my
func (h *MaintenanceHandler) GetMy(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	tickets, err := h.service.GetMyTickets(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tickets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tickets": tickets})
}

// GET /api/staff/maintenance-tickets?status=
func (h *MaintenanceHandler) GetByBranch(c *gin.Context) {
	role := c.MustGet("role").(string)
	var branchID *uint
	if role == "staff" {
		bRaw := c.MustGet("branch_id")
		if bRaw == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "akunmu belum di-assign ke cabang"})
			return
		}
		b := uint(bRaw.(float64))
		branchID = &b
	}

	tickets, err := h.service.GetByBranch(branchID, c.Query("status"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tickets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tickets": tickets})
}

type updateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=open in_progress resolved"`
}

// PATCH /api/staff/maintenance-tickets/:id
func (h *MaintenanceHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req updateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateStatus(uint(id), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "status diperbarui"})
}
