package handler

import (
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type registerRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.authService.Register(service.RegisterInput{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Phone:    req.Phone,
	})
	if err != nil {
		if err == service.ErrEmailAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "registration successful",
		"user":    user,
	})
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type updateProfileRequest struct {
	Name  string `json:"name" binding:"required"`
	Phone string `json:"phone"`
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	user, err := h.authService.UpdateProfile(service.UpdateProfileInput{
		UserID: userID,
		Name:   req.Name,
		Phone:  req.Phone,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := uuid.Parse(c.MustGet("user_id").(string))

	err := h.authService.ChangePassword(service.ChangePasswordInput{
		UserID:          userID,
		CurrentPassword: req.CurrentPassword,
		NewPassword:     req.NewPassword,
	})
	if err != nil {
		if err == service.ErrWrongCurrentPassword {
			c.JSON(http.StatusBadRequest, gin.H{"error": "kata sandi saat ini salah"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to change password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password berhasil diubah"})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, user, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"token":   token,
		"user":    user,
	})
}
