package ws

import (
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Client merepresentasikan 1 koneksi WebSocket aktif (1 tab browser)
type Client struct {
	Conn   *websocket.Conn
	UserID uuid.UUID
	RoomID uuid.UUID
	Send   chan []byte
}

// Hub menyimpan semua client yang terhubung, dikelompokkan per chat room,
// supaya pesan bisa di-broadcast ke semua peserta di room yang sama.
type Hub struct {
	mu    sync.RWMutex
	rooms map[uuid.UUID]map[*Client]bool
}

func NewHub() *Hub {
	return &Hub{rooms: make(map[uuid.UUID]map[*Client]bool)}
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[client.RoomID] == nil {
		h.rooms[client.RoomID] = make(map[*Client]bool)
	}
	h.rooms[client.RoomID][client] = true
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if clients, ok := h.rooms[client.RoomID]; ok {
		delete(clients, client)
		close(client.Send)
		if len(clients) == 0 {
			delete(h.rooms, client.RoomID)
		}
	}
}

// Broadcast mengirim pesan ke semua client yang sedang terhubung di room tersebut
func (h *Hub) Broadcast(roomID uuid.UUID, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.rooms[roomID] {
		select {
		case client.Send <- message:
		default:
			// buffer penuh/client macet, skip supaya tidak blocking client lain
		}
	}
}
