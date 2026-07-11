package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type NotificationService struct {
	notifRepo *repository.NotificationRepository
}

func NewNotificationService(notifRepo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{notifRepo: notifRepo}
}

func (s *NotificationService) Notify(userID uuid.UUID, title, body, notifType string) error {
	return s.notifRepo.Create(&models.Notification{
		UserID: userID,
		Title:  title,
		Body:   body,
		Type:   notifType,
	})
}

func (s *NotificationService) GetMyNotifications(userID uuid.UUID, page, limit int) ([]models.Notification, int64, error) {
	return s.notifRepo.FindByUserID(userID, page, limit)
}

func (s *NotificationService) GetUnreadCount(userID uuid.UUID) (int64, error) {
	return s.notifRepo.CountUnread(userID)
}

func (s *NotificationService) MarkAsRead(id uint, userID uuid.UUID) error {
	return s.notifRepo.MarkAsRead(id, userID)
}

func (s *NotificationService) MarkAllAsRead(userID uuid.UUID) error {
	return s.notifRepo.MarkAllAsRead(userID)
}
