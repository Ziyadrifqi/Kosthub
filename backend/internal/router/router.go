package router

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/handler"
	"github.com/Ziyadrifqi/kosthub/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Setup(cfg *config.Config, authHandler *handler.AuthHandler, roomHandler *handler.RoomHandler) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "KostHub backend is running 🚀"})
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// publik: siapa saja bisa lihat listing kamar (termasuk sebelum login)
		rooms := api.Group("/rooms")
		{
			rooms.GET("", roomHandler.ListRooms)
			rooms.GET("/:id", roomHandler.GetRoom)
		}

		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			protected.GET("/me", func(c *gin.Context) {
				c.JSON(200, gin.H{
					"user_id": c.MustGet("user_id"),
					"email":   c.MustGet("email"),
				})
			})
			protected.POST("/rooms", roomHandler.CreateRoom)
		}
	}

	return r
}
