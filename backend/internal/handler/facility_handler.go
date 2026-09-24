package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type FacilityHandler struct {
	service *service.FacilityService
}

func NewFacilityHandler(s *service.FacilityService) *FacilityHandler {
	return &FacilityHandler{service: s}
}

// GET /api/facilities — PUBLIK, master list
func (h *FacilityHandler) List(c *gin.Context) {
	facilities, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch facilities"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"facilities": facilities})
}

type createFacilityRequest struct {
	Name string `json:"name" binding:"required"`
	Icon string `json:"icon"`
}

// POST /api/super-admin/facilities
func (h *FacilityHandler) Create(c *gin.Context) {
	var req createFacilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	f, err := h.service.Create(req.Name, req.Icon)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create facility"})
		return
	}
	c.JSON(http.StatusCreated, f)
}

// DELETE /api/super-admin/facilities/:id
func (h *FacilityHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete facility"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

type setRoomFacilitiesRequest struct {
	FacilityIDs []uint `json:"facility_ids"`
}

// PUT /api/staff/rooms/:id/facilities
func (h *FacilityHandler) SetRoomFacilities(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	var req setRoomFacilitiesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.SetRoomFacilities(uint(roomID), req.FacilityIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update facilities"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "fasilitas kamar diperbarui"})
}
