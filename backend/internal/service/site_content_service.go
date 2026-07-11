package service

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/google/uuid"
)

type SiteContentService struct {
	repo *repository.SiteContentRepository
}

func NewSiteContentService(repo *repository.SiteContentRepository) *SiteContentService {
	return &SiteContentService{repo: repo}
}

func (s *SiteContentService) GetAll() ([]models.SiteContent, error) {
	return s.repo.GetAll()
}

func (s *SiteContentService) Upsert(key, value string, userID uuid.UUID) error {
	return s.repo.Upsert(key, value, userID)
}
