package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Message types
const (
	MessageTypeVote       = "vote"
	MessageTypeComment    = "comment"
	MessageTypeReply      = "reply"
	MessageTypeOnline     = "online"
	MessageTypeOffline    = "offline"
	MessageTypeTyping     = "typing"
	MessageTypeStopTyping = "stop_typing"
	MessageTypeUserJoined = "user_joined"
	MessageTypeUserLeft   = "user_left"
)

// Message represents a WebSocket message
type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	UserID    string      `json:"user_id,omitempty"`
	Username  string      `json:"username,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// Client represents a connected WebSocket client
type Client struct {
	Hub      *Hub
	ID       string
	UserID   string
	Username string
	Socket   *websocket.Conn
	Send     chan []byte
	mu       sync.Mutex
}

// Hub manages all WebSocket connections
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

			log.Printf("User joined: %s (%s), Total clients: %d", client.Username, client.UserID, len(h.clients))

			// Send current online users list to the new user
			onlineUsers := h.GetOnlineUsers()
			onlineUsersMsg := Message{
				Type:      "online_users",
				Data:      onlineUsers,
				Timestamp: time.Now(),
			}
			h.BroadcastToUser(client.UserID, onlineUsersMsg)

			// Broadcast user joined to all other users
			h.broadcastMessage(Message{
				Type:      MessageTypeUserJoined,
				UserID:    client.UserID,
				Username:  client.Username,
				Timestamp: time.Now(),
			})

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()

			log.Printf("User left: %s (%s), Total clients: %d", client.Username, client.UserID, len(h.clients))

			// Broadcast user left
			h.broadcastMessage(Message{
				Type:      MessageTypeUserLeft,
				UserID:    client.UserID,
				Username:  client.Username,
				Timestamp: time.Now(),
			})

		case message := <-h.broadcast:
			// Send message to clients, but don't mutate the clients map while holding the read lock.
			// Collect clients that need removal and perform deletions under write lock.
			h.mu.RLock()
			var toRemove []*Client
			for client := range h.clients {
				select {
				case client.Send <- message:
					// sent successfully
				default:
					// mark for removal
					toRemove = append(toRemove, client)
				}
			}
			h.mu.RUnlock()

			if len(toRemove) > 0 {
				h.mu.Lock()
				for _, client := range toRemove {
					if _, ok := h.clients[client]; ok {
						close(client.Send)
						delete(h.clients, client)
					}
				}
				h.mu.Unlock()
			}
		}
	}
}

// BroadcastMessage sends a message to all connected clients
func (h *Hub) BroadcastMessage(msg Message) {
	h.broadcastMessage(msg)
}

// BroadcastToUser sends a message to a specific user
func (h *Hub) BroadcastToUser(userID string, msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	// Collect clients that need removal to avoid mutating map under read lock
	var toRemove []*Client
	h.mu.RLock()
	for client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- data:
				// sent
			default:
				toRemove = append(toRemove, client)
			}
		}
	}
	h.mu.RUnlock()

	if len(toRemove) > 0 {
		h.mu.Lock()
		for _, client := range toRemove {
			if _, ok := h.clients[client]; ok {
				close(client.Send)
				delete(h.clients, client)
			}
		}
		h.mu.Unlock()
	}
}

// GetOnlineUsers returns list of online users
func (h *Hub) GetOnlineUsers() []map[string]string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	users := make([]map[string]string, 0)
	for client := range h.clients {
		users = append(users, map[string]string{
			"id":       client.UserID,
			"username": client.Username,
		})
	}
	return users
}

// GetOnlineCount returns number of online users
func (h *Hub) GetOnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// broadcastMessage is a helper function to broadcast messages
func (h *Hub) broadcastMessage(msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.broadcast <- data
}
