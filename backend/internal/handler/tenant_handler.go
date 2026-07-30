package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TenantHandler struct {
	service *service.TenantService
}

func NewTenantHandler(s *service.TenantService) *TenantHandler {
	return &TenantHandler{service: s}
}

func (h *TenantHandler) getBranchScope(c *gin.Context) (*uint, bool) {
	role := c.MustGet("role").(string)
	if role != "staff" {
		return nil, true // super_admin lihat semua cabang
	}
	bRaw := c.MustGet("branch_id")
	if bRaw == nil {
		return nil, false
	}
	b := uint(bRaw.(float64))
	return &b, true
}

// GET /api/staff/tenants?search=&page=&limit=
func (h *TenantHandler) List(c *gin.Context) {
	branchID, ok := h.getBranchScope(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "akunmu belum di-assign ke cabang"})
		return
	}

	page, _ := strconv.Atoi(c.Query("page"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	result, err := h.service.GetTenants(branchID, c.Query("search"), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tenants"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// GET /api/staff/tenants/:userId
func (h *TenantHandler) GetDetail(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	branchID, ok := h.getBranchScope(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "akunmu belum di-assign ke cabang"})
		return
	}

	result, err := h.service.GetTenantDetail(userID, branchID)
	if err != nil {
		if err == service.ErrTenantNotInBranch {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch tenant detail"})
		return
	}
	c.JSON(http.StatusOK, result)
}

type updateTenantProfileRequest struct {
	IDNumber              string `json:"id_number"`
	Address               string `json:"address"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyContactPhone string `json:"emergency_contact_phone"`
	Occupation            string `json:"occupation"`
	StaffNote             string `json:"staff_note"`
}

// PUT /api/staff/tenants/:userId/profile
func (h *TenantHandler) UpdateProfile(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	branchID, ok := h.getBranchScope(c)
	if !ok {
		c.JSON(http.StatusForbidden, gin.H{"error": "akunmu belum di-assign ke cabang"})
		return
	}
	if branchID != nil {
		result, err := h.service.GetTenantDetail(userID, branchID)
		if err != nil || result == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "penyewa ini tidak memiliki riwayat booking di cabangmu"})
			return
		}
	}

	var req updateTenantProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	staffID, _ := uuid.Parse(c.MustGet("user_id").(string))

	if err := h.service.UpdateProfile(userID, service.UpdateProfileInput{
		IDNumber: req.IDNumber, Address: req.Address,
		EmergencyContactName: req.EmergencyContactName, EmergencyContactPhone: req.EmergencyContactPhone,
		Occupation: req.Occupation, StaffNote: req.StaffNote,
	}, staffID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profil penyewa diperbarui"})
}

// GET /api/profile/tenant — customer lihat data tambahan miliknya sendiri
func (h *TenantHandler) GetMyProfile(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	profile, err := h.service.GetMyProfile(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"profile": nil}) // wajar kalau belum pernah isi
		return
	}
	c.JSON(http.StatusOK, gin.H{"profile": profile})
}

type updateMyProfileRequest struct {
	IDNumber              string `json:"id_number"`
	Address               string `json:"address"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyContactPhone string `json:"emergency_contact_phone"`
	Occupation            string `json:"occupation"`
}

// PUT /api/profile/tenant — customer isi/update data tambahan miliknya sendiri
// TIDAK bisa mengubah staff_note — itu murni field internal staff.
func (h *TenantHandler) UpdateMyProfile(c *gin.Context) {
	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	var req updateMyProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateOwnProfile(userID, service.UpdateProfileInput{
		IDNumber: req.IDNumber, Address: req.Address,
		EmergencyContactName: req.EmergencyContactName, EmergencyContactPhone: req.EmergencyContactPhone,
		Occupation: req.Occupation,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "data berhasil disimpan"})
}
