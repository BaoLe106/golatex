package doc

import (
	"log"
	// "net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// type Message struct {
// 	Content map[string]interface{} `json:"content"`
// }

type Message struct {
	Action       string `json:"action"`
	Offset       int    `json:"offset"`
	Text         string `json:"text"`
	Type         string `json:"type"`
	Length       int    `json:"length"`
	SkipOperation bool  `json:"skipOperation"`
	Format       string `json:"format"`
}


type Hub struct {
	Clients 		map[*Client]bool
	Broadcast 	chan Message
	Mutex 			sync.Mutex
	SessionData map[string][]Message
}

type Client struct {
	Conn 			*websocket.Conn
	Hub  			*Hub
	SessionID string
}

func NewHub() *Hub {
	return &Hub{
			Clients:   		make(map[*Client]bool),
			Broadcast: 		make(chan Message),
			SessionData: 	make(map[string][]Message),
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

