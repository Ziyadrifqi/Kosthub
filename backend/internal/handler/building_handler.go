package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type BuildingHandler struct {
	service *service.BuildingService
}

func NewBuildingHandler(s *service.BuildingService) *BuildingHandler {
	return &BuildingHandler{service: s}
}

type createBuildingRequest struct {
	BranchID   uint   `json:"branch_id" binding:"required"`
	Name       string `json:"name" binding:"required"`
	TotalFloor int    `json:"total_floor"`
}

func (h *BuildingHandler) Create(c *gin.Context) {
	var req createBuildingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.MustGet("role").(string)
	if role == "staff" {
		userBranchID := c.MustGet("branch_id")
		if userBranchID == nil || uint(userBranchID.(float64)) != req.BranchID {
			c.JSON(http.StatusForbidden, gin.H{"error": "kamu hanya bisa menambah gedung di cabangmu sendiri"})
			return
		}
	}

	building, err := h.service.Create(service.CreateBuildingInput{
		BranchID: req.BranchID, Name: req.Name, TotalFloor: req.TotalFloor,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create building"})
		return
	}
	c.JSON(http.StatusCreated, building)
}

// GET /api/buildings?branch_id=1 — publik/staff, dipakai buat dropdown
func (h *BuildingHandler) List(c *gin.Context) {
	branchIDStr := c.Query("branch_id")
	if branchIDStr != "" {
		branchID, err := strconv.Atoi(branchIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch_id"})
			return
		}
		buildings, err := h.service.GetByBranch(uint(branchID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch buildings"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"buildings": buildings})
		return
	}

	buildings, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch buildings"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"buildings": buildings})
}
