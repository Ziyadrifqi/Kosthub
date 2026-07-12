package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserManagementService struct {
	db       *gorm.DB
	userRepo *repository.UserRepository
}

func NewUserManagementService(db *gorm.DB, userRepo *repository.UserRepository) *UserManagementService {
	return &UserManagementService{db: db, userRepo: userRepo}
}

type ListUsersOutput struct {
	Users []models.User `json:"users"`
	Total int64         `json:"total"`
	Page  int           `json:"page"`
	Limit int           `json:"limit"`
}

func (s *UserManagementService) ListAll(search string, page, limit int) (*ListUsersOutput, error) {
	users, total, err := s.userRepo.FindAllPaginated(search, page, limit)
	if err != nil {
		return nil, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	return &ListUsersOutput{Users: users, Total: total, Page: page, Limit: limit}, nil
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
