package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type BranchHandler struct {
	service *service.BranchService
}

func NewBranchHandler(s *service.BranchService) *BranchHandler {
	return &BranchHandler{service: s}
}

type branchRequest struct {
	Name    string `json:"name" binding:"required"`
	City    string `json:"city" binding:"required"`
	Address string `json:"address"`
}

// GET /api/branches — PUBLIK, dipakai frontend gantiin file statis
func (h *BranchHandler) List(c *gin.Context) {
	branches, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch branches"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"branches": branches})
}

func (h *BranchHandler) Create(c *gin.Context) {
	var req branchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	b, err := h.service.Create(service.BranchInput{Name: req.Name, City: req.City, Address: req.Address})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create branch"})
		return
	}
	c.JSON(http.StatusCreated, b)
}

func (h *BranchHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch id"})
		return
	}
	var req branchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	b, err := h.service.Update(uint(id), service.BranchInput{Name: req.Name, City: req.City, Address: req.Address})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update branch"})
		return
	}
	c.JSON(http.StatusOK, b)
}

func (h *BranchHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch id"})
		return
	}
	if err := h.service.Delete(uint(id)); err != nil {
		if err == service.ErrBranchInUse {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete branch"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "branch deleted"})
}
