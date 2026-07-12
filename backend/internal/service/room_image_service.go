package service

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
)

type RoomImageService struct {
	repo     *repository.RoomImageRepository
	roomRepo *repository.RoomRepository
}

func NewRoomImageService(repo *repository.RoomImageRepository, roomRepo *repository.RoomRepository) *RoomImageService {
	return &RoomImageService{repo: repo, roomRepo: roomRepo}
}

func (s *RoomImageService) Upload(roomID uint, imageURL string) (*models.RoomImage, error) {
	existing, err := s.repo.FindByRoomID(roomID)
	if err != nil {
		return nil, err
	}
	// foto pertama otomatis jadi primary
	img := &models.RoomImage{RoomID: roomID, ImageURL: imageURL, IsPrimary: len(existing) == 0}
	if err := s.repo.Create(img); err != nil {
		return nil, err
	}
	return img, nil
}

func (s *RoomImageService) GetByRoomID(roomID uint) ([]models.RoomImage, error) {
	return s.repo.FindByRoomID(roomID)
}

func (s *RoomImageService) Delete(imageID uint) error {
	img, err := s.repo.FindByID(imageID)
	if err != nil {
		return err
	}

	// hapus record database dulu — kalau ini gagal, file fisik tidak ikut kehapus (aman, tidak yatim)
	if err := s.repo.Delete(imageID); err != nil {
		return err
	}

	// baru hapus file fisik. Kalau gagal (misal file sudah tidak ada), tidak dianggap error fatal —
	// data di database sudah bersih, yang penting.
	s.deletePhysicalFile(img.ImageURL)

	return nil
}

// deletePhysicalFile mengubah URL publik (/uploads/rooms/xxx.jpg) jadi path lokal di disk,
// lalu menghapus filenya. Silent-fail kalau file tidak ditemukan, supaya tidak bikin
// keseluruhan request error hanya karena file sudah hilang duluan.
func (s *RoomImageService) deletePhysicalFile(imageURL string) {
	relativePath := strings.TrimPrefix(imageURL, "/uploads/")
	fullPath := filepath.Join("uploads", relativePath)
	_ = os.Remove(fullPath)
}

func (s *RoomImageService) SetPrimary(roomID, imageID uint) error {
	return s.repo.SetPrimary(roomID, imageID)
}

func (s *RoomImageService) GetRoomBranch(roomID uint) (uint, error) {
	room, err := s.roomRepo.FindByID(roomID)
	if err != nil {
		return 0, err
	}
	return room.BranchID, nil
}
