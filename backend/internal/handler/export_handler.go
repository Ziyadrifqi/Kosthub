package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ExportHandler struct {
	service *service.ExportService
}

func NewExportHandler(s *service.ExportService) *ExportHandler {
	return &ExportHandler{service: s}
}

// GET /api/owner/transactions/export?start=2026-01-01&end=2026-12-31&method=&branch_id=
func (h *ExportHandler) ExportTransactions(c *gin.Context) {
	startStr := c.Query("start")
	endStr := c.Query("end")

	if startStr == "" || endStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start dan end wajib diisi (format YYYY-MM-DD)"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal start salah"})
		return
	}
	endDate, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format tanggal end salah"})
		return
	}

	var branchID *uint
	if b := c.Query("branch_id"); b != "" {
		if id, err := strconv.Atoi(b); err == nil {
			bb := uint(id)
			branchID = &bb
		}
	}

	f, err := h.service.GenerateTransactionsExcel(service.ExportTransactionsInput{
		Method: c.Query("method"), BranchID: branchID,
		StartDate: startDate, EndDate: endDate,
	})
	if err != nil {
		if errors.Is(err, service.ErrNoDataToExport) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Tidak ada transaksi pada rentang tanggal/filter yang dipilih"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuat file export"})
		return
	}

	filename := "transaksi_" + startStr + "_sampai_" + endStr + ".xlsx"
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengirim file"})
	}
}
