package latex

import (
	"log"
	// "net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// type Message struct {
// 	Content map[string]interface{} `json:"content"`
// }
type Message []interface{}

type Hub struct {
	Clients 		map[*Client]bool
	Broadcast 	chan string
	Mutex 			sync.Mutex
	SessionData map[string]string
}

type Client struct {
	Conn 			*websocket.Conn
	Hub  			*Hub
	SessionID string
}

func NewHub() *Hub {
	return &Hub{
			Clients:   		make(map[*Client]bool),
			Broadcast: 		make(chan string),
			SessionData: 	make(map[string]string),
	}
}

func (h *Hub) Run() {
	for {
			msg := <-h.Broadcast
			h.Mutex.Lock()
			for client := range h.Clients {
					err := client.Conn.WriteJSON(msg)
					if err != nil {
							log.Println("Error writing to client:", err)
							client.Conn.Close()
							delete(h.Clients, client)
					}
			}
			h.Mutex.Unlock()
	}
}

