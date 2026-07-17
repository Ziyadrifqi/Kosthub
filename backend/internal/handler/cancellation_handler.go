package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CancellationHandler struct {
	service *service.CancellationService
}

func NewCancellationHandler(s *service.CancellationService) *CancellationHandler {
	return &CancellationHandler{service: s}
}

type createCancellationRequest struct {
	BookingID string `json:"booking_id" binding:"required"`
	Type      string `json:"type" binding:"required"`
	Reason    string `json:"reason" binding:"required"`
}

// POST /api/cancellation-requests
func (h *CancellationHandler) Create(c *gin.Context) {
	var req createCancellationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bookingID, err := uuid.Parse(req.BookingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking_id"})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	result, err := h.service.CreateRequest(service.CreateCancellationInput{
		BookingID: bookingID, UserID: userID, Type: req.Type, Reason: req.Reason,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// GET /api/staff/cancellation-requests
func (h *CancellationHandler) GetPending(c *gin.Context) {
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

	reqs, err := h.service.GetPending(branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"requests": reqs})
}

type processCancellationRequest struct {
	Approve bool   `json:"approve"`
	Note    string `json:"note"`
}

// PATCH /api/staff/cancellation-requests/:id
func (h *CancellationHandler) Process(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req processCancellationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID, _ := uuid.Parse(c.MustGet("user_id").(string))

	if err := h.service.Process(id, req.Approve, adminID, req.Note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "processed"})
}
