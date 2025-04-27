package wsProvider

import "log"


var Handler *HandlerStruct

func NewHandler() {
	hub := NewHub()
	go hub.Run()
	Handler = &HandlerStruct{Hub: hub}
	// return &Handler{Hub: hub}
}

func (h *Hub) Run() {
	for {
		msg := <-h.Broadcast
		h.Mutex.Lock()
		for _, clients := range h.Sessions {
			for client := range clients {
				err := client.Conn.WriteJSON(msg)
				if err != nil {
					log.Println("Error writing to client:", err)
					client.Conn.Close()
					delete(clients, client)
				}
			}
		}
		h.Mutex.Unlock()
	}
}