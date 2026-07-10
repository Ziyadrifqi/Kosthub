package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService *service.ReportService
}

func NewReportHandler(reportService *service.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

// GET /api/owner/reports/summary
func (h *ReportHandler) GetSummary(c *gin.Context) {
	summary, err := h.reportService.GetSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch report summary"})
		return
	}
	c.JSON(http.StatusOK, summary)
}
