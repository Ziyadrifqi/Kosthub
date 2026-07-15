package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Ziyadrifqi/kosthub/backend/internal/models"
	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/Ziyadrifqi/kosthub/backend/internal/ws"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type WSHandler struct {
	hub          *ws.Hub
	chatService  *service.ChatService
	notifService *service.NotificationService
	jwtSecret    string
}

func NewWSHandler(hub *ws.Hub, chatService *service.ChatService, notifService *service.NotificationService, jwtSecret string) *WSHandler {
	return &WSHandler{hub: hub, chatService: chatService, notifService: notifService, jwtSecret: jwtSecret}
}

var upgrader = websocket.Upgrader{
	// izinkan koneksi dari frontend kita saja
	CheckOrigin: func(r *http.Request) bool { return true }, // untuk dev; ketatkan saat production
}

type incomingMessage struct {
	Message string `json:"message"`
}

type outgoingMessage struct {
	Type      string    `json:"type"` // message
	ID        uuid.UUID `json:"id"`
	SenderID  uuid.UUID `json:"sender_id"`
	Message   string    `json:"message"`
	CreatedAt string    `json:"created_at"`
}

// GET /ws/chat?token=xxx&room_id=xxx
// Token dikirim lewat query param karena WebSocket browser tidak bisa kirim header custom.
func (h *WSHandler) HandleConnection(c *gin.Context) {
	tokenString := c.Query("token")
	roomIDParam := c.Query("room_id")

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	claims, _ := token.Claims.(jwt.MapClaims)
	userID, err := uuid.Parse(claims["user_id"].(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	roomID, err := uuid.Parse(roomIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room_id"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	client := &ws.Client{
		Conn:   conn,
		UserID: userID,
		RoomID: roomID,
		Send:   make(chan []byte, 256),
	}

	h.hub.Register(client)
	defer h.hub.Unregister(client)

	go h.writePump(client)
	h.readPump(client)
}

func (h *WSHandler) readPump(client *ws.Client) {
	defer client.Conn.Close()
	for {
		_, raw, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		var incoming incomingMessage
		if err := json.Unmarshal(raw, &incoming); err != nil {
			continue
		}
		if incoming.Message == "" {
			continue
		}

		msg := &models.ChatMessage{
			ChatRoomID: client.RoomID,
			SenderID:   client.UserID,
			Message:    incoming.Message,
		}

		if err := h.chatService.SaveMessage(msg); err != nil {
			log.Printf("failed to save chat message: %v", err)
			continue
		}

		out := outgoingMessage{
			Type:      "message",
			ID:        msg.ID,
			SenderID:  msg.SenderID,
			Message:   msg.Message,
			CreatedAt: msg.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
		payload, _ := json.Marshal(out)

		h.hub.Broadcast(client.RoomID, payload)

		// kirim notifikasi ke pihak lain di percakapan ini (bukan ke pengirim sendiri)
		h.notifyOtherParty(client.RoomID, client.UserID, incoming.Message)
	}
}

// notifyOtherParty mencari siapa lawan bicara di room ini (customer atau admin)
// dan kirim notifikasi ke dia — supaya tetap tahu ada pesan baru meski sedang offline.
func (h *WSHandler) notifyOtherParty(roomID, senderID uuid.UUID, message string) {
	room, err := h.chatService.GetRoomByID(roomID)
	if err != nil {
		return
	}

	preview := message
	if len(preview) > 60 {
		preview = preview[:60] + "..."
	}

	if senderID == room.UserID {
		// customer yang kirim → notifikasi ke SEMUA staff di cabang itu
		if room.BranchID != nil {
			h.notifService.NotifyStaffByBranch(*room.BranchID, "Pesan Chat Baru", preview, "info")
		}
		return
	}

	// staff yang kirim (balas) → notifikasi ke customer pemilik chat
	h.notifService.Notify(room.UserID, "Admin Membalas Chat", preview, "info")
}
func (h *WSHandler) writePump(client *ws.Client) {
	defer client.Conn.Close()
	for message := range client.Send {
		if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			break
		}
	}
}
