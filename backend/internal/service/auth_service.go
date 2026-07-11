package service

import (
	"errors"
	"strconv"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrEmailAlreadyExists = errors.New("email already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

func roleNameOrDefault(user *models.User) string {
	if user.Role != nil {
		return user.Role.Name
	}
	return "customer"
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
	Phone    string
}

func (s *AuthService) Register(input RegisterInput) (*models.User, error) {
	exists, err := s.userRepo.EmailExists(input.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var phonePtr *string
	if input.Phone != "" {
		phonePtr = &input.Phone
	}

	user := &models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Phone:        phonePtr,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(email, password string) (string, *models.User, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, ErrInvalidCredentials
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

var ErrWrongCurrentPassword = errors.New("current password is incorrect")

type UpdateProfileInput struct {
	UserID uuid.UUID
	Name   string
	Phone  string
}

func (s *AuthService) UpdateProfile(input UpdateProfileInput) (*models.User, error) {
	user, err := s.userRepo.FindByID(input.UserID)
	if err != nil {
		return nil, err
	}

	user.Name = input.Name
	if input.Phone != "" {
		user.Phone = &input.Phone
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

type ChangePasswordInput struct {
	UserID          uuid.UUID
	CurrentPassword string
	NewPassword     string
}

func (s *AuthService) ChangePassword(input ChangePasswordInput) error {
	user, err := s.userRepo.FindByID(input.UserID)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.CurrentPassword)); err != nil {
		return ErrWrongCurrentPassword
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(input.UserID, string(newHash))
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	expireHours, err := strconv.Atoi(s.cfg.JWTExpireHours)
	if err != nil {
		expireHours = 24
	}

	claims := jwt.MapClaims{
		"user_id": user.ID.String(),
		"email":   user.Email,
		"role":    roleNameOrDefault(user),
		"exp":     time.Now().Add(time.Duration(expireHours) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}
