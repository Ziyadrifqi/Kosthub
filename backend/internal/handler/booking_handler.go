package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookingHandler struct {
	bookingService *service.BookingService
}

func NewBookingHandler(bookingService *service.BookingService) *BookingHandler {
	return &BookingHandler{bookingService: bookingService}
}

type createBookingRequest struct {
	RoomID         uint   `json:"room_id" binding:"required"`
	CheckIn        string `json:"check_in" binding:"required"` // format: 2026-08-01
	DurationMonths int    `json:"duration_months" binding:"required,gt=0"`
}

// POST /api/bookings (protected)
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req createBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid check_in format, use YYYY-MM-DD"})
		return
	}

	userIDStr := c.MustGet("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	booking, err := h.bookingService.CreateBooking(service.CreateBookingInput{
		UserID:         userID,
		RoomID:         req.RoomID,
		CheckIn:        checkIn,
		DurationMonths: req.DurationMonths,
	})
	if err != nil {
		if err == repository.ErrRoomNotAvailable {
			c.JSON(http.StatusConflict, gin.H{"error": "room is no longer available"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create booking"})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

// GET /api/bookings/my (protected)
func (h *BookingHandler) GetMyBookings(c *gin.Context) {
	userIDStr := c.MustGet("user_id").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	page, _ := strconv.Atoi(c.Query("page"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	bookings, total, err := h.bookingService.GetMyBookings(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings, "total": total})
}

// GET /api/bookings/:id (protected)
func (h *BookingHandler) GetBooking(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking id"})
		return
	}

	booking, err := h.bookingService.GetBookingByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	c.JSON(http.StatusOK, booking)
}

// GET /api/staff/bookings/ending-soon?days=30
func (h *BookingHandler) GetEndingSoon(c *gin.Context) {
	days, err := strconv.Atoi(c.DefaultQuery("days", "30"))
	if err != nil {
		days = 30
	}

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

	bookings, err := h.bookingService.GetEndingSoon(branchID, days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}

type createDirectBookingRequest struct {
	RoomID         uint   `json:"room_id" binding:"required"`
	CheckIn        string `json:"check_in" binding:"required"`
	DurationMonths int    `json:"duration_months" binding:"required,gt=0"`

	CustomerEmail string `json:"customer_email" binding:"required,email"`
	CustomerName  string `json:"customer_name"`
	CustomerPhone string `json:"customer_phone"`

	PaymentMethod string `json:"payment_method" binding:"required,oneof=cash manual_transfer"`
	PaymentNote   string `json:"payment_note"`
}

// POST /api/staff/bookings/direct — untuk booking walk-in
func (h *BookingHandler) CreateDirectBooking(c *gin.Context) {
	var req createDirectBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal salah, gunakan YYYY-MM-DD"})
		return
	}

	staffID, _ := uuid.Parse(c.MustGet("user_id").(string))

	// cari user existing dulu, kalau tidak ada bikin akun baru otomatis
	customerID, err := h.bookingService.FindOrCreateCustomer(req.CustomerEmail, req.CustomerName, req.CustomerPhone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses data customer"})
		return
	}

	booking, err := h.bookingService.CreateDirectBooking(service.CreateDirectBookingInput{
		UserID: customerID, RoomID: req.RoomID, CheckIn: checkIn,
		DurationMonths: req.DurationMonths, CreatedByStaff: staffID,
		PaymentMethod: req.PaymentMethod,
		PaymentNote:   req.PaymentNote,
	})
	if err != nil {
		if err == repository.ErrRoomNotAvailable {
			c.JSON(http.StatusConflict, gin.H{"error": "kamar sudah tidak tersedia"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat booking"})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

// GET /api/staff/bookings/upcoming-checkins
func (h *BookingHandler) GetUpcomingCheckIns(c *gin.Context) {
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

	bookings, err := h.bookingService.GetUpcomingCheckIns(branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}

type rescheduleRequest struct {
	CheckIn string `json:"check_in" binding:"required"`
}

// PATCH /api/staff/bookings/:id/reschedule
func (h *BookingHandler) Reschedule(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req rescheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newDate, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal salah"})
		return
	}

	if err := h.bookingService.RescheduleCheckIn(id, newDate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reschedule"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "jadwal diperbarui"})
}

// PATCH /api/staff/bookings/:id/check-in
func (h *BookingHandler) MarkCheckedIn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.bookingService.MarkCheckedIn(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ditandai sudah check-in"})
}
