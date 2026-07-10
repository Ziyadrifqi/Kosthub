package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserManagementService struct {
	db *gorm.DB
}

func NewUserManagementService(db *gorm.DB) *UserManagementService {
	return &UserManagementService{db: db}
}

func (s *UserManagementService) ListAll() ([]models.User, error) {
	var users []models.User
	err := s.db.Preload("Role").Order("created_at desc").Find(&users).Error
	return users, err
}

func (s *UserManagementService) UpdateRole(userID uuid.UUID, roleName string) error {
	var role models.Role
	if err := s.db.Where("name = ?", roleName).First(&role).Error; err != nil {
		return err
	}
	return s.db.Model(&models.User{}).Where("id = ?", userID).Update("role_id", role.ID).Error
}
