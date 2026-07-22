package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SiteContentHandler struct {
	contentService *service.SiteContentService
}

func NewSiteContentHandler(contentService *service.SiteContentService) *SiteContentHandler {
	return &SiteContentHandler{contentService: contentService}
}

// GET /api/site-contents — PUBLIK, dipakai frontend untuk render konten dinamis
func (h *SiteContentHandler) GetPublicContents(c *gin.Context) {
	contents, err := h.contentService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch content"})
		return
	}

	// ubah jadi map key:value biar gampang dipakai frontend
	result := make(map[string]string)
	for _, c := range contents {
		result[c.Key] = c.Value
	}
	c.JSON(http.StatusOK, result)
}

type updateContentRequest struct {
	Value string `json:"value"`
}

// PUT /api/staff/site-contents/:key — khusus staff/super_admin
func (h *SiteContentHandler) UpdateContent(c *gin.Context) {
	key := c.Param("key")

	var req updateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	if err := h.contentService.Upsert(key, req.Value, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update content"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "content updated"})
}

var allowedBankKeys = map[string]bool{
	"bank_name":           true,
	"bank_account_number": true,
	"bank_account_holder": true,
	"bank_note":           true,
}

type updateBankInfoRequest struct {
	Value string `json:"value"`
}

// PUT /api/owner/bank-info/:key — HANYA boleh ubah 4 key yang di-whitelist di atas,
// supaya owner tidak bisa iseng ubah konten lain (About/Help/dll) yang bukan wewenangnya.
func (h *SiteContentHandler) UpdateBankInfo(c *gin.Context) {
	key := c.Param("key")

	if !allowedBankKeys[key] {
		c.JSON(http.StatusForbidden, gin.H{"error": "key ini bukan bagian dari info rekening"})
		return
	}

	var req updateBankInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	if err := h.contentService.Upsert(key, req.Value, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "info rekening diperbarui"})
}
