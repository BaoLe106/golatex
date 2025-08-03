package wsProvider

import (
	"encoding/json"
	"log"
)

var Handler *HandlerStruct

func NewHandler() {
	hub := NewHub()
	go hub.Run()
	Handler = &HandlerStruct{Hub: hub}
	// return &Handler{Hub: hub}
}

// func (h *Hub) Run() {
// 	for msg := range h.Broadcast{
// 		// msg := <-h.Broadcast
// 		h.Mutex.RLock()
// 		for _, clients := range h.Sessions {
// 			for client := range clients {
// 				err := client.Conn.WriteJSON(msg)
// 				if err != nil {
// 					log.Println("Error writing to client:", err)
// 					client.Conn.Close()
// 					delete(clients, client)
// 				}
// 			}
// 		}
// 		h.Mutex.Unlock()
// 	}
// }

func (h *Hub) Run() {
	for msg := range h.Broadcast {
		h.Mutex.RLock()

		// Convert the string message to a SignalingMessage or appropriate struct
		var message SignalingMessage
		err := json.Unmarshal([]byte(msg), &message)
		if err != nil {
			log.Println("Error unmarshalling broadcast message:", err)
			h.Mutex.RUnlock()
			continue
		}

		// Check if we should broadcast to a specific session
		if message.SessionID != "" {
			if clients, exists := h.Sessions[message.SessionID]; exists {
				for peerID, conn := range clients {
					// Skip sending back to the original sender if needed
					if message.PeerID != "" && peerID == message.PeerID {
						continue
					}

					err := conn.WriteJSON(message)
					if err != nil {
						log.Println("Error writing to client:", err)
						conn.Close()
						h.Mutex.RUnlock()

						// Need write lock for deletion
						h.Mutex.Lock()
						delete(clients, peerID)
						if len(clients) == 0 {
							delete(h.Sessions, message.SessionID)
						}
						h.Mutex.Unlock()

						// Reacquire read lock for next iteration
						h.Mutex.RLock()
					}
				}
			}
		} else {
			// Broadcast to all sessions if no specific session specified
			for _, clients := range h.Sessions {
				for peerID, conn := range clients {
					err := conn.WriteJSON(message)
					if err != nil {
						log.Println("Error writing to client:", err)
						conn.Close()
						h.Mutex.RUnlock()

						h.Mutex.Lock()
						delete(clients, peerID)
						h.Mutex.Unlock()

						h.Mutex.RLock()
					}
				}
			}
		}

		h.Mutex.RUnlock()
	}
}
