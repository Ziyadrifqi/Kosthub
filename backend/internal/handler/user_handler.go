package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService *service.UserManagementService
}

func NewUserHandler(userService *service.UserManagementService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GET /api/super-admin/users
func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.userService.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

type updateRoleRequest struct {
	RoleName string `json:"role_name" binding:"required"`
}

// PATCH /api/super-admin/users/:id/role
func (h *UserHandler) UpdateRole(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req updateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.userService.UpdateRole(userID, req.RoleName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "role updated"})
}
