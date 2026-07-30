package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TenantRepository struct {
	db *gorm.DB
}

func NewTenantRepository(db *gorm.DB) *TenantRepository {
	return &TenantRepository{db: db}
}

// FindTenantsByBranch — semua customer YANG PERNAH booking (status apa saja)
// di cabang tertentu, baik online maupun walk-in. Distinct per user.
func (r *TenantRepository) FindTenantsByBranch(branchID uint, search string, page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	subQuery := r.db.Table("bookings").
		Select("DISTINCT bookings.user_id").
		Joins("JOIN rooms ON rooms.id = bookings.room_id").
		Where("rooms.branch_id = ?", branchID)

	query := r.db.Model(&models.User{}).
		Where("id IN (?)", subQuery)

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
		limit = 20
	}
	offset := (page - 1) * limit

	if err := query.Order("name asc").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

// FindTenantsAll — dipakai super_admin kalau mau lihat semua cabang sekaligus
func (r *TenantRepository) FindTenantsAll(search string, page, limit int) ([]models.User, int64, error) {
	subQuery := r.db.Table("bookings").Select("DISTINCT user_id")

	query := r.db.Model(&models.User{}).Where("id IN (?)", subQuery)

	if search != "" {
		term := "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", term, term)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	var users []models.User
	if err := query.Order("name asc").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

// VerifyTenantInBranch — pastikan staff cuma bisa akses data penyewa yang PERNAH
// booking di cabangnya sendiri, bukan sembarang user.
func (r *TenantRepository) VerifyTenantInBranch(userID uuid.UUID, branchID uint) (bool, error) {
	var count int64
	err := r.db.Table("bookings").
		Joins("JOIN rooms ON rooms.id = bookings.room_id").
		Where("bookings.user_id = ? AND rooms.branch_id = ?", userID, branchID).
		Count(&count).Error
	return count > 0, err
}

func (r *TenantRepository) FindProfile(userID uuid.UUID) (*models.TenantProfile, error) {
	var profile models.TenantProfile
	err := r.db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *TenantRepository) UpsertProfile(profile *models.TenantProfile) error {
	var existing models.TenantProfile
	err := r.db.Where("user_id = ?", profile.UserID).First(&existing).Error
	if err != nil {
		return r.db.Create(profile).Error
	}
	return r.db.Model(&existing).Where("user_id = ?", profile.UserID).Updates(profile).Error
}

// FindBookingHistoryInBranch — riwayat booking user ini KHUSUS di cabang tertentu
func (r *TenantRepository) FindBookingHistoryInBranch(userID uuid.UUID, branchID uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.Preload("Room").
		Joins("JOIN rooms ON rooms.id = bookings.room_id").
		Where("bookings.user_id = ? AND rooms.branch_id = ?", userID, branchID).
		Order("bookings.created_at desc").
		Find(&bookings).Error
	return bookings, err
}
