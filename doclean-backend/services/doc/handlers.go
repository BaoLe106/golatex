package doc

import (
	"log"
	"net/http"
	"fmt"
	// "github.com/BaoLe106/doclean/doclean-backend/utils"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Handler struct {
	Hub *Hub
}

func NewHandler() *Handler {
	hub := NewHub()
	go hub.Run()
	return &Handler{Hub: hub}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (be careful with this in production)
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Handler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionID"] 
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error during connection upgrade:", err)
		return
	}

	client := &Client{Conn: conn, Hub: h.Hub, SessionID: sessionID}
	h.Hub.Mutex.Lock()
	h.Hub.Clients[client] = true
	// do not send to the current client
	if data, exists := h.Hub.SessionData[sessionID]; exists {
		fmt.Println("#DEBUG::data", data)
		err := client.Conn.WriteJSON(map[string]interface{}{
			"data": data,
		})

		if err != nil {
			log.Println("Error sending session data to client:", err)
		}
	}


	h.Hub.Mutex.Unlock()

	defer func() {
			h.Hub.Mutex.Lock()
			delete(h.Hub.Clients, client)
			h.Hub.Mutex.Unlock()
			conn.Close()
	}()

	for { //run until err then break
			fmt.Println("#DEBUG::hello")
			var msg Message
			err := conn.ReadJSON(&msg)
			
			if err != nil {
					log.Println("Error reading message:", err)
					break
			}
			
			h.Hub.Mutex.Lock()
			fmt.Println("#DEBUG::msg", msg)
			// fmt.Println("#DEBUG::msg content", msg.Content)
			h.Hub.SessionData[sessionID] = append(h.Hub.SessionData[sessionID], msg)
			fmt.Println("#DEBUG::clients length", len(h.Hub.Clients))
			for otherClient := range h.Hub.Clients {
				fmt.Println("#DEBUG::do you write here?", otherClient, client)
				if otherClient != client { // Skip the sender
					err := otherClient.Conn.WriteJSON(msg)
					fmt.Println("#DEBUG::really write here?")
					if err != nil {
						log.Println("Error broadcasting message:", err)
						delete(h.Hub.Clients, otherClient) // Clean up disconnected clients
					}
				}
			}

			h.Hub.Mutex.Unlock()
	}
}