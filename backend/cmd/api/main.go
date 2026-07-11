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
)

func main() {
	cfg := config.Load()

	db := database.ConnectPostgres(cfg)
	_ = database.ConnectRedis(cfg)

	// Auth
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	// Rooms
	roomRepo := repository.NewRoomRepository(db)
	roomService := service.NewRoomService(roomRepo)
	roomHandler := handler.NewRoomHandler(roomService)

	// Bookings
	notifRepo := repository.NewNotificationRepository(db)
	notifService := service.NewNotificationService(notifRepo)
	notificationHandler := handler.NewNotificationHandler(notifService)

	bookingRepo := repository.NewBookingRepository(db)
	bookingService := service.NewBookingService(bookingRepo, roomRepo, notifService)
	bookingHandler := handler.NewBookingHandler(bookingService)

	paymentRepo := repository.NewPaymentRepository(db)
	paymentService := service.NewPaymentService(paymentRepo, bookingRepo, notifService)
	paymentHandler := handler.NewPaymentHandler(paymentService)

	reportService := service.NewReportService(db)
	reportHandler := handler.NewReportHandler(reportService)

	userMgmtService := service.NewUserManagementService(db)
	userHandler := handler.NewUserHandler(userMgmtService)

	r := router.Setup(cfg, authHandler, roomHandler, bookingHandler, paymentHandler, reportHandler, userHandler, notificationHandler)

	worker.StartBookingExpiryWorker(bookingService, 5*time.Minute)

	log.Printf("server running on http://localhost:%s\n", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
