package router

import (
	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"github.com/Ziyadrifqi/kosthub/backend/internal/handler"
	"github.com/Ziyadrifqi/kosthub/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Setup(
	cfg *config.Config,
	authHandler *handler.AuthHandler,
	roomHandler *handler.RoomHandler,
	bookingHandler *handler.BookingHandler,
	paymentHandler *handler.PaymentHandler,
	reportHandler *handler.ReportHandler,
	userHandler *handler.UserHandler,
	notificationHandler *handler.NotificationHandler,
	favoriteHandler *handler.FavoriteHandler,
	reviewHandler *handler.ReviewHandler,
	chatHandler *handler.ChatHandler,
	wsHandler *handler.WSHandler,
	contentHandler *handler.SiteContentHandler,
	buildingHandler *handler.BuildingHandler,
	roomTypeHandler *handler.RoomTypeHandler,
	roomImageHandler *handler.RoomImageHandler,
	cancellationHandler *handler.CancellationHandler,
	bankAccountHandler *handler.BankAccountHandler,
	branchHandler *handler.BranchHandler,
	extensionHandler *handler.ExtensionHandler,
	exportHandler *handler.ExportHandler,
) *gin.Engine {
	r := gin.Default()

	r.Static("/uploads", "./uploads")

	// WebSocket — di luar /api dan sebelum CORS middleware
	r.GET("/ws/chat", wsHandler.HandleConnection)

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
		// ===== PUBLIK (tanpa login) =====
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		rooms := api.Group("/rooms")
		{
			rooms.GET("", roomHandler.ListRooms)
			rooms.GET("/:id", roomHandler.GetRoom)
			rooms.GET("/:id/reviews", reviewHandler.GetRoomReviews)
		}

		api.GET("/site-contents", contentHandler.GetPublicContents)
		api.GET("/bank-accounts", bankAccountHandler.ListActive)
		api.GET("/buildings", buildingHandler.List)
		api.GET("/room-types", roomTypeHandler.List)
		api.GET("/branches", branchHandler.List)
		api.GET("/reviews/featured", reviewHandler.GetFeatured)

		// ===== WAJIB LOGIN =====
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			protected.GET("/me", func(c *gin.Context) {
				c.JSON(200, gin.H{
					"user_id":   c.MustGet("user_id"),
					"email":     c.MustGet("email"),
					"role":      c.MustGet("role"),
					"branch_id": c.MustGet("branch_id"),
				})
			})

			protected.PATCH("/profile", authHandler.UpdateProfile)
			protected.PATCH("/profile/password", authHandler.ChangePassword)

			bookings := protected.Group("/bookings")
			{
				bookings.POST("", bookingHandler.CreateBooking)
				bookings.GET("/my", bookingHandler.GetMyBookings)
				bookings.GET("/:id", bookingHandler.GetBooking)
			}

			protected.POST("/payments/upload-proof", paymentHandler.UploadProof)

			notifications := protected.Group("/notifications")
			{
				notifications.GET("", notificationHandler.GetMyNotifications)
				notifications.PATCH("/:id/read", notificationHandler.MarkAsRead)
				notifications.PATCH("/read-all", notificationHandler.MarkAllAsRead)
			}

			chat := protected.Group("/chat")
			{
				chat.GET("/my-room", chatHandler.GetMyRoom)
				chat.GET("/:roomId/messages", chatHandler.GetMessages)
			}

			protected.POST("/favorites/:roomId/toggle", favoriteHandler.Toggle)
			protected.GET("/favorites", favoriteHandler.GetMyFavorites)
			protected.POST("/reviews", reviewHandler.CreateReview)
			protected.PATCH("/chat/my-room/branch", chatHandler.SetMyRoomBranch)
			protected.POST("/cancellation-requests", cancellationHandler.Create)
			protected.POST("/extension-requests", extensionHandler.Create)
			protected.POST("/extension-requests/:id/upload-proof", extensionHandler.UploadProof)

			// ===== STAFF ONLY — operasional harian =====
			staff := protected.Group("/staff")
			staff.Use(middleware.RoleRequired("staff"))
			{
				staff.POST("/rooms", roomHandler.CreateRoom)
				staff.PATCH("/rooms/:id", roomHandler.UpdateRoom)
				staff.DELETE("/rooms/:id", roomHandler.DeleteRoom)

				staff.POST("/rooms/:id/images", roomImageHandler.Upload)
				staff.GET("/rooms/:id/images", roomImageHandler.List)
				staff.DELETE("/rooms/:id/images/:imageId", roomImageHandler.Delete)
				staff.PATCH("/rooms/:id/images/:imageId/primary", roomImageHandler.SetPrimary)

				staff.GET("/payments/pending", paymentHandler.GetPendingPayments)
				staff.PATCH("/payments/:id/verify", paymentHandler.VerifyPayment)

				staff.GET("/chat/rooms", chatHandler.ListOpenRooms)

				staff.GET("/bookings/ending-soon", bookingHandler.GetEndingSoon)
				staff.POST("/bookings/direct", bookingHandler.CreateDirectBooking)

				staff.GET("/cancellation-requests", cancellationHandler.GetPending)
				staff.PATCH("/cancellation-requests/:id", cancellationHandler.Process)

				staff.GET("/bookings/upcoming-checkins", bookingHandler.GetUpcomingCheckIns)
				staff.PATCH("/bookings/:id/reschedule", bookingHandler.Reschedule)
				staff.PATCH("/bookings/:id/check-in", bookingHandler.MarkCheckedIn)

				staff.GET("/extension-requests", extensionHandler.GetWaiting)
				staff.PATCH("/extension-requests/:id", extensionHandler.Process)
			}

			// ===== OWNER & SUPER_ADMIN — pengawasan =====
			owner := protected.Group("/owner")
			owner.Use(middleware.RoleRequired("owner"))
			{
				owner.GET("/reports/summary", reportHandler.GetSummary)
				owner.GET("/payments/:id/audit-logs", paymentHandler.GetAuditLogs)
				owner.GET("/audit-logs", paymentHandler.GetAllAuditLogs)
				owner.GET("/bank-accounts", bankAccountHandler.ListAll)
				owner.POST("/bank-accounts", bankAccountHandler.Create)
				owner.PATCH("/bank-accounts/:id", bankAccountHandler.Update)
				owner.PATCH("/bank-accounts/:id/toggle", bankAccountHandler.ToggleActive)
				owner.DELETE("/bank-accounts/:id", bankAccountHandler.Delete)
				owner.GET("/transactions", paymentHandler.GetTransactions)
				owner.GET("/transactions/export", exportHandler.ExportTransactions)
			}

			// ===== SUPER_ADMIN ONLY — user, gedung, tipe kamar =====
			superAdmin := protected.Group("/super-admin")
			superAdmin.Use(middleware.RoleRequired("super_admin"))
			{
				superAdmin.GET("/users", userHandler.ListUsers)
				superAdmin.PATCH("/users/:id/role", userHandler.UpdateRole)
				superAdmin.DELETE("/users/:id", userHandler.Deactivate)

				superAdmin.POST("/buildings", buildingHandler.Create)
				superAdmin.PATCH("/buildings/:id", buildingHandler.Update)
				superAdmin.DELETE("/buildings/:id", buildingHandler.Delete)

				superAdmin.POST("/room-types", roomTypeHandler.Create)

				superAdmin.GET("/site-contents", contentHandler.GetPublicContents)
				superAdmin.PUT("/site-contents/:key", contentHandler.UpdateContent)

				superAdmin.PATCH("/room-types/:id", roomTypeHandler.Update)
				superAdmin.DELETE("/room-types/:id", roomTypeHandler.Delete)

				superAdmin.POST("/branches", branchHandler.Create)
				superAdmin.PATCH("/branches/:id", branchHandler.Update)
				superAdmin.DELETE("/branches/:id", branchHandler.Delete)

				superAdmin.GET("/reviews", reviewHandler.GetAllForAdmin)
				superAdmin.PATCH("/reviews/:id/featured", reviewHandler.ToggleFeatured)
			}
		}
	}

	return r
}
