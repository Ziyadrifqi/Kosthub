package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviewService: reviewService}
}

type createReviewRequest struct {
	RoomID  uint   `json:"room_id" binding:"required"`
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	var req createReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	review, err := h.reviewService.CreateReview(service.CreateReviewInput{
		UserID:  userID,
		RoomID:  req.RoomID,
		Rating:  req.Rating,
		Comment: req.Comment,
	})
	if err != nil {
		if err == repository.ErrReviewRequiresCompletedBooking {
			c.JSON(http.StatusForbidden, gin.H{"error": "kamu hanya bisa review kamar yang pernah kamu tempati"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

func (h *ReviewHandler) GetRoomReviews(c *gin.Context) {
	roomID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	result, err := h.reviewService.GetRoomReviews(uint(roomID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GET /api/reviews/featured — PUBLIK, dipakai homepage
func (h *ReviewHandler) GetFeatured(c *gin.Context) {
	reviews, err := h.reviewService.GetFeatured(6)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch featured reviews"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// GET /api/super-admin/reviews
func (h *ReviewHandler) GetAllForAdmin(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	result, err := h.reviewService.GetAllForAdmin(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// PATCH /api/super-admin/reviews/:id/featured
func (h *ReviewHandler) ToggleFeatured(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	review, err := h.reviewService.ToggleFeatured(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle"})
		return
	}
	c.JSON(http.StatusOK, review)
}
