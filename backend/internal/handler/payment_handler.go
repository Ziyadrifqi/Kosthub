package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

// POST /api/payments/upload-proof (protected, multipart/form-data)
// fields: booking_id (text), proof (file)
func (h *PaymentHandler) UploadProof(c *gin.Context) {
	bookingIDStr := c.PostForm("booking_id")
	bookingID, err := uuid.Parse(bookingIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking_id"})
		return
	}

	file, err := c.FormFile("proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file 'proof' is required"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%d%s", bookingID.String(), time.Now().Unix(), ext)
	savePath := filepath.Join("uploads", "payments", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	proofURL := "/uploads/payments/" + filename

	payment, err := h.paymentService.UploadProof(service.UploadProofInput{
		BookingID: bookingID,
		ProofURL:  proofURL,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record payment"})
		return
	}

	c.JSON(http.StatusCreated, payment)
}

// GET /api/admin/payments/pending (protected, admin only)
func (h *PaymentHandler) GetPendingPayments(c *gin.Context) {
	payments, total, err := h.paymentService.GetPendingPayments(1, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pending payments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments, "total": total})
}

type verifyPaymentRequest struct {
	Approve bool   `json:"approve"`
	Note    string `json:"note"`
}

// PATCH /api/admin/payments/:id/verify (protected, admin only)
func (h *PaymentHandler) VerifyPayment(c *gin.Context) {
	paymentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}

	var req verifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminIDStr := c.MustGet("user_id").(string)
	adminID, err := uuid.Parse(adminIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid admin"})
		return
	}

	if err := h.paymentService.VerifyPayment(paymentID, req.Approve, adminID, req.Note, c.ClientIP()); err != nil {
		switch err {
		case repository.ErrRejectReasonRequired:
			c.JSON(http.StatusBadRequest, gin.H{"error": "note is required when rejecting a payment"})
		case repository.ErrPaymentAlreadyProcessed:
			c.JSON(http.StatusConflict, gin.H{"error": "payment has already been processed"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify payment"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "payment verification recorded"})
}

// GET /api/admin/payments/:id/audit-logs — untuk owner/super_admin audit siapa ngapain
func (h *PaymentHandler) GetAuditLogs(c *gin.Context) {
	paymentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}

	logs, err := h.paymentService.GetAuditLogs(paymentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}
