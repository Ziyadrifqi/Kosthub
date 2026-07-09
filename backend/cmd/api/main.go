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

	// wiring dependency: repository -> service -> handler
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	r := router.Setup(cfg, authHandler)

	log.Printf("server running on http://localhost:%s\n", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
