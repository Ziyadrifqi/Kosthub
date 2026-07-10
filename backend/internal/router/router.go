package router

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/handler"
	"github.com/Ziyadrifqi/kosthub/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Setup(cfg *config.Config, authHandler *handler.AuthHandler, roomHandler *handler.RoomHandler, bookingHandler *handler.BookingHandler, paymentHandler *handler.PaymentHandler, reportHandler *handler.ReportHandler, userHandler *handler.UserHandler) *gin.Engine {
	r := gin.Default()

	// izinkan akses file upload bukti transfer
	r.Static("/uploads", "./uploads")

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

			bookings := protected.Group("/bookings")
			{
				bookings.POST("", bookingHandler.CreateBooking)
				bookings.GET("/my", bookingHandler.GetMyBookings)
				bookings.GET("/:id", bookingHandler.GetBooking)
			}
			protected.POST("/payments/upload-proof", paymentHandler.UploadProof)

			admin := protected.Group("/admin")
			admin.Use(middleware.AdminOnly())
			{
				admin.GET("/payments/pending", paymentHandler.GetPendingPayments)
				admin.PATCH("/payments/:id/verify", paymentHandler.VerifyPayment)
			}

			owner := protected.Group("/owner")
			owner.Use(middleware.RoleRequired("owner", "super_admin"))
			{
				owner.GET("/payments/:id/audit-logs", paymentHandler.GetAuditLogs)
			}
		}
		// STAFF & FINANCE & SUPER_ADMIN — verifikasi payment
		finance := protected.Group("/admin")
		finance.Use(middleware.RoleRequired("finance", "super_admin"))
		{
			finance.GET("/payments/pending", paymentHandler.GetPendingPayments)
			finance.PATCH("/payments/:id/verify", paymentHandler.VerifyPayment)
		}

		// STAFF & SUPER_ADMIN — kelola kamar
		staff := protected.Group("/staff")
		staff.Use(middleware.RoleRequired("staff", "super_admin"))
		{
			staff.POST("/rooms", roomHandler.CreateRoom)
		}

		// OWNER & SUPER_ADMIN — laporan & audit
		owner := protected.Group("/owner")
		owner.Use(middleware.RoleRequired("owner", "super_admin"))
		{
			owner.GET("/reports/summary", reportHandler.GetSummary)
			owner.GET("/payments/:id/audit-logs", paymentHandler.GetAuditLogs)
		}

		// SUPER_ADMIN ONLY — kelola user & role
		superAdmin := protected.Group("/super-admin")
		superAdmin.Use(middleware.RoleRequired("super_admin"))
		{
			superAdmin.GET("/users", userHandler.ListUsers)
			superAdmin.PATCH("/users/:id/role", userHandler.UpdateRole)
		}
	}

	return r
}
