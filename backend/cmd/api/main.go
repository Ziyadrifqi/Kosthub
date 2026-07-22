package main

import (
	"log"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/database"
	"github.com/Ziyadrifqi/kosthub/backend/internal/handler"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/router"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/Ziyadrifqi/kosthub/backend/internal/worker"
	"github.com/Ziyadrifqi/kosthub/backend/internal/ws"
)

func main() {
	cfg := config.Load()

	db := database.ConnectPostgres(cfg)
	_ = database.ConnectRedis(cfg)

	// ===== Auth =====
	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	authService := service.NewAuthService(userRepo, roleRepo, cfg)
	emailService := service.NewEmailService(cfg)
	authHandler := handler.NewAuthHandler(authService, emailService)

	// ===== Room Images (dibutuhkan RoomService) =====
	roomImageRepo := repository.NewRoomImageRepository(db)

	// ===== Rooms =====
	roomRepo := repository.NewRoomRepository(db)
	roomService := service.NewRoomService(roomRepo, roomImageRepo)
	roomHandler := handler.NewRoomHandler(roomService)

	roomImageService := service.NewRoomImageService(roomImageRepo, roomRepo)
	roomImageHandler := handler.NewRoomImageHandler(roomImageService)

	// ===== Notifications (dibutuhkan booking & payment service) =====
	notifRepo := repository.NewNotificationRepository(db)
	notifService := service.NewNotificationService(notifRepo, userRepo)
	notificationHandler := handler.NewNotificationHandler(notifService)

	// ===== Bookings =====
	bookingRepo := repository.NewBookingRepository(db)
	bookingService := service.NewBookingService(bookingRepo, roomRepo, userRepo, roleRepo, notifService)
	bookingHandler := handler.NewBookingHandler(bookingService)

	// ===== Payments =====
	paymentRepo := repository.NewPaymentRepository(db)
	paymentService := service.NewPaymentService(paymentRepo, bookingRepo, notifService)
	paymentHandler := handler.NewPaymentHandler(paymentService)

	// ===== Reports =====
	reportService := service.NewReportService(db)
	reportHandler := handler.NewReportHandler(reportService)

	// ===== User Management =====
	userMgmtService := service.NewUserManagementService(db, userRepo)
	userHandler := handler.NewUserHandler(userMgmtService)

	// ===== Favorites =====
	favRepo := repository.NewFavoriteRepository(db)
	favService := service.NewFavoriteService(favRepo)
	favoriteHandler := handler.NewFavoriteHandler(favService)

	// ===== Reviews =====
	reviewRepo := repository.NewReviewRepository(db)
	reviewService := service.NewReviewService(reviewRepo)
	reviewHandler := handler.NewReviewHandler(reviewService)

	// ===== Chat =====
	hub := ws.NewHub()
	chatRepo := repository.NewChatRepository(db)
	chatService := service.NewChatService(chatRepo)
	chatHandler := handler.NewChatHandler(chatService)
	wsHandler := handler.NewWSHandler(hub, chatService, notifService, cfg.JWTSecret)

	// ===== Site Content (CMS) =====
	contentRepo := repository.NewSiteContentRepository(db)
	contentService := service.NewSiteContentService(contentRepo)
	contentHandler := handler.NewSiteContentHandler(contentService)

	// ===== Buildings =====
	buildingRepo := repository.NewBuildingRepository(db)
	buildingService := service.NewBuildingService(buildingRepo)
	buildingHandler := handler.NewBuildingHandler(buildingService)

	// ===== Room Types =====
	roomTypeRepo := repository.NewRoomTypeRepository(db)
	roomTypeService := service.NewRoomTypeService(roomTypeRepo)
	roomTypeHandler := handler.NewRoomTypeHandler(roomTypeService)

	// === Cancel booking ====
	cancellationRepo := repository.NewCancellationRepository(db)
	cancellationService := service.NewCancellationService(cancellationRepo, bookingRepo, notifService)
	cancellationHandler := handler.NewCancellationHandler(cancellationService)

	bankAccountRepo := repository.NewBankAccountRepository(db)
	bankAccountService := service.NewBankAccountService(bankAccountRepo)
	bankAccountHandler := handler.NewBankAccountHandler(bankAccountService)

	// ===== Router =====
	r := router.Setup(
		cfg,
		authHandler,
		roomHandler,
		bookingHandler,
		paymentHandler,
		reportHandler,
		userHandler,
		notificationHandler,
		favoriteHandler,
		reviewHandler,
		chatHandler,
		wsHandler,
		contentHandler,
		buildingHandler,
		roomTypeHandler,
		roomImageHandler,
		cancellationHandler,
		bankAccountHandler,
	)

	// ===== Background Worker =====
	worker.StartBookingExpiryWorker(bookingService, 5*time.Minute)
	worker.StartLeaseCompletionWorker(bookingService, 1*time.Hour) // cek tiap jam cukup, bukan hal darurat

	log.Printf("server running on http://localhost:%s\n", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
