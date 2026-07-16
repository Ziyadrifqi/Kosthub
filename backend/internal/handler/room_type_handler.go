package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type RoomTypeHandler struct {
	service *service.RoomTypeService
}

func NewRoomTypeHandler(s *service.RoomTypeService) *RoomTypeHandler {
	return &RoomTypeHandler{service: s}
}

type createRoomTypeRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	BasePrice   float64 `json:"base_price" binding:"required,gt=0"`
}

func (h *RoomTypeHandler) Create(c *gin.Context) {
	var req createRoomTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rt, err := h.service.Create(service.CreateRoomTypeInput{
		Name: req.Name, Description: req.Description, BasePrice: req.BasePrice,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create room type"})
		return
	}
	c.JSON(http.StatusCreated, rt)
}

// GET /api/room-types — publik/staff, dipakai buat dropdown
func (h *RoomTypeHandler) List(c *gin.Context) {
	types, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch room types"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"room_types": types})
}

type updateRoomTypeRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	BasePrice   float64 `json:"base_price" binding:"required,gt=0"`
}

// PATCH /api/super-admin/room-types/:id
func (h *RoomTypeHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room type id"})
		return
	}

	var req updateRoomTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rt, err := h.service.Update(uint(id), service.UpdateRoomTypeInput{
		Name: req.Name, Description: req.Description, BasePrice: req.BasePrice,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update room type"})
		return
	}

	c.JSON(http.StatusOK, rt)
}

// DELETE /api/super-admin/room-types/:id
func (h *RoomTypeHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room type id"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if err == service.ErrRoomTypeInUse {
			c.JSON(http.StatusConflict, gin.H{"error": "tidak bisa menghapus tipe kamar yang masih dipakai kamar aktif"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete room type"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "room type deleted"})
}
