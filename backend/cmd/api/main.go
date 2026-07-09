package main

import (
	"log"

	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/database"
	"github.com/Ziyadrifqi/kosthub/backend/internal/handler"
	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/Ziyadrifqi/kosthub/backend/internal/router"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
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

	r := router.Setup(cfg, authHandler, roomHandler)

	log.Printf("server running on http://localhost:%s\n", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
