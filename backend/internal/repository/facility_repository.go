package repository

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"gorm.io/gorm"
)

type FacilityRepository struct {
	db *gorm.DB
}

func NewFacilityRepository(db *gorm.DB) *FacilityRepository {
	return &FacilityRepository{db: db}
}

func (r *FacilityRepository) Create(f *models.Facility) error {
	return r.db.Create(f).Error
}

func (r *FacilityRepository) FindAll() ([]models.Facility, error) {
	var facilities []models.Facility
	err := r.db.Order("name asc").Find(&facilities).Error
	return facilities, err
}

func (r *FacilityRepository) Delete(id uint) error {
	return r.db.Delete(&models.Facility{}, id).Error
}

// SetRoomFacilities — ganti TOTAL daftar fasilitas kamar (hapus semua, insert ulang
// yang dicentang). Lebih simpel & aman daripada diff manual satu-satu.
func (r *FacilityRepository) SetRoomFacilities(roomID uint, facilityIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("DELETE FROM room_facilities WHERE room_id = ?", roomID).Error; err != nil {
			return err
		}
		for _, fid := range facilityIDs {
			if err := tx.Exec("INSERT INTO room_facilities (room_id, facility_id) VALUES (?, ?)", roomID, fid).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
