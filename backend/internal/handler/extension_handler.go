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

type ExtensionHandler struct {
	service *service.ExtensionService
}

func NewExtensionHandler(s *service.ExtensionService) *ExtensionHandler {
	return &ExtensionHandler{service: s}
}

type createExtensionRequest struct {
	BookingID        string `json:"booking_id" binding:"required"`
	AdditionalMonths int    `json:"additional_months" binding:"required,gt=0"`
}

// POST /api/extension-requests
func (h *ExtensionHandler) Create(c *gin.Context) {
	var req createExtensionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bookingID, err := uuid.Parse(req.BookingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking_id"})
		return
	}

	ext, err := h.service.CreateRequest(bookingID, req.AdditionalMonths)
	if err != nil {
		switch err {
		case repository.ErrBookingAlreadyEnded:
			c.JSON(http.StatusBadRequest, gin.H{"error": "masa sewa sudah habis, tidak bisa diperpanjang lagi"})
		case repository.ErrExtensionPending:
			c.JSON(http.StatusConflict, gin.H{"error": "sudah ada pengajuan perpanjangan yang sedang diproses"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat pengajuan"})
		}
		return
	}

	c.JSON(http.StatusCreated, ext)
}

// POST /api/extension-requests/:id/upload-proof
func (h *ExtensionHandler) UploadProof(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	file, err := c.FormFile("proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file 'proof' wajib diisi"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("extension_%s_%d%s", id.String(), time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", "extensions", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	if err := h.service.UploadProof(id, "/uploads/extensions/"+filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save proof"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "bukti transfer terkirim, menunggu verifikasi admin"})
}

// GET /api/staff/extension-requests
func (h *ExtensionHandler) GetWaiting(c *gin.Context) {
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

	exts, err := h.service.GetWaiting(branchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": exts})
}

type processExtensionRequest struct {
	Approve bool   `json:"approve"`
	Note    string `json:"note"`
}

// PATCH /api/staff/extension-requests/:id
func (h *ExtensionHandler) Process(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req processExtensionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID, _ := uuid.Parse(c.MustGet("user_id").(string))

	if err := h.service.Process(id, req.Approve, adminID, req.Note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal memproses pengajuan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "processed"})
}
