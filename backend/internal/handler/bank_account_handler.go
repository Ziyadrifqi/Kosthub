package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BankAccountHandler struct {
	service *service.BankAccountService
}

func NewBankAccountHandler(s *service.BankAccountService) *BankAccountHandler {
	return &BankAccountHandler{service: s}
}

type bankAccountRequest struct {
	BankName      string `json:"bank_name" binding:"required"`
	AccountNumber string `json:"account_number" binding:"required"`
	AccountHolder string `json:"account_holder" binding:"required"`
	Note          string `json:"note"`
}

// GET /api/bank-accounts — PUBLIK, cuma yang aktif, dipakai customer di halaman upload
func (h *BankAccountHandler) ListActive(c *gin.Context) {
	accounts, err := h.service.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch bank accounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"accounts": accounts})
}

// GET /api/owner/bank-accounts — owner lihat semua termasuk nonaktif
func (h *BankAccountHandler) ListAll(c *gin.Context) {
	accounts, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch bank accounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"accounts": accounts})
}

func (h *BankAccountHandler) Create(c *gin.Context) {
	var req bankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	acc, err := h.service.Create(service.BankAccountInput{
		BankName: req.BankName, AccountNumber: req.AccountNumber,
		AccountHolder: req.AccountHolder, Note: req.Note,
	}, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create bank account"})
		return
	}
	c.JSON(http.StatusCreated, acc)
}

func (h *BankAccountHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req bankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	acc, err := h.service.Update(uint(id), service.BankAccountInput{
		BankName: req.BankName, AccountNumber: req.AccountNumber,
		AccountHolder: req.AccountHolder, Note: req.Note,
	}, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update bank account"})
		return
	}
	c.JSON(http.StatusOK, acc)
}

func (h *BankAccountHandler) ToggleActive(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	acc, err := h.service.ToggleActive(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle"})
		return
	}
	c.JSON(http.StatusOK, acc)
}

func (h *BankAccountHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
