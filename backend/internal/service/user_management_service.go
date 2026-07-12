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

func (s *UserManagementService) UpdateRoleAndBranch(userID uuid.UUID, roleName string, branchID *uint) error {
	var role models.Role
	if err := s.db.Where("name = ?", roleName).First(&role).Error; err != nil {
		return err
	}

	updates := map[string]interface{}{"role_id": role.ID}

	// branch_id cuma relevan untuk staff — role lain di-null-kan otomatis
	if roleName == "staff" {
		updates["branch_id"] = branchID
	} else {
		updates["branch_id"] = nil
	}

	return s.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
}

func (s *UserManagementService) Deactivate(userID uuid.UUID) error {
	return s.db.Delete(&models.User{}, userID).Error // soft delete via DeletedAt
}
