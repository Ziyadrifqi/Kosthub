package service

import (
	"crypto/rand"
	"encoding/hex"
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
	ErrEmailAlreadyExists   = errors.New("email already registered")
	ErrInvalidCredentials   = errors.New("invalid email or password")
	ErrWrongCurrentPassword = errors.New("current password is incorrect")
)

type AuthService struct {
	userRepo *repository.UserRepository
	roleRepo *repository.RoleRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, roleRepo *repository.RoleRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, roleRepo: roleRepo, cfg: cfg}
}

// ===== REGISTER =====

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

	// assign role "customer" secara eksplisit, bukan cuma fallback di kode
	customerRole, err := s.roleRepo.FindByName("customer")
	if err == nil {
		user.RoleID = &customerRole.ID
	}
	// kalau role "customer" belum ada di tabel roles, user tetap dibuat
	// dengan role_id NULL — tidak fatal, tapi sebaiknya seed role dulu (lihat langkah di bawah)

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

// ===== LOGIN =====

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

func (s *AuthService) generateToken(user *models.User) (string, error) {
	expireHours, err := strconv.Atoi(s.cfg.JWTExpireHours)
	if err != nil {
		expireHours = 24
	}

	claims := jwt.MapClaims{
		"user_id":   user.ID.String(),
		"email":     user.Email,
		"role":      roleNameOrDefault(user),
		"branch_id": nil,
		"exp":       time.Now().Add(time.Duration(expireHours) * time.Hour).Unix(),
		"iat":       time.Now().Unix(),
	}

	if user.BranchID != nil {
		claims["branch_id"] = *user.BranchID
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func roleNameOrDefault(user *models.User) string {
	if user.Role != nil {
		return user.Role.Name
	}
	return "customer"
}

// ===== PROFILE =====

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

var ErrInvalidResetToken = errors.New("token reset tidak valid atau sudah kedaluwarsa")

func (s *AuthService) ForgotPassword(email string, emailService *EmailService) error {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		// SENGAJA tidak return error — supaya orang tidak bisa "menebak" email
		// mana yang terdaftar cuma dari respons API (keamanan)
		return nil
	}

	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)
	token := hex.EncodeToString(tokenBytes)
	expiresAt := time.Now().Add(1 * time.Hour)

	if err := s.userRepo.SetResetToken(user.ID, token, expiresAt); err != nil {
		return err
	}

	return emailService.SendPasswordReset(user.Email, user.Name, token)
}

func (s *AuthService) ResetPassword(token, newPassword string) error {
	user, err := s.userRepo.FindByResetToken(token)
	if err != nil {
		return ErrInvalidResetToken
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePassword(user.ID, string(newHash)); err != nil {
		return err
	}

	return s.userRepo.ClearResetToken(user.ID)
}
