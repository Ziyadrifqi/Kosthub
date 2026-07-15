package repository

import (
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Role").Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Role").Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) EmailExists(email string) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) UpdatePassword(userID uuid.UUID, newHash string) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", userID).
		Update("password_hash", newHash).Error
}

func (r *UserRepository) FindAllPaginated(search string, page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{}).Preload("Role").Preload("Branch")

	if search != "" {
		term := "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", term, term)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) SetResetToken(userID uuid.UUID, token string, expiresAt time.Time) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"reset_token":            token,
		"reset_token_expires_at": expiresAt,
	}).Error
}

func (r *UserRepository) FindByResetToken(token string) (*models.User, error) {
	var user models.User
	err := r.db.Where("reset_token = ? AND reset_token_expires_at > ?", token, time.Now()).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) ClearResetToken(userID uuid.UUID) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"reset_token":            nil,
		"reset_token_expires_at": nil,
	}).Error
}
