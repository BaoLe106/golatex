package latex

import (
	"log"

	// "net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type CreateTexFileInputSchema struct {
	Content string `json:"content"`
}

type AWSLambdaTexToPdfPayload struct {
	SessionID	 	string `json:"session_id"`
	TexFilename string `json:"tex_filename"`
	TexFile     string `json:"tex_file"`
}

type Hub struct {
	Sessions 		map[string]map[*Client]bool
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
			Sessions:   	make(map[string]map[*Client]bool),
			Broadcast: 		make(chan string),
			SessionData: 	make(map[string]string),
	}
}
type Handler struct {
	Hub *Hub
}

func NewHandler() *Handler {
	hub := NewHub()
	go hub.Run()
	return &Handler{Hub: hub}
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

type UserTier string

const (
    TierPlayground UserTier = "playground"
    TierGuest      UserTier = "guest"
    TierFree       UserTier = "free"
    TierBasic      UserTier = "basic"
    TierStandard   UserTier = "standard"
)

type TierLimits struct {
    MaxCollaborators int
    MaxProjects      int
    RequiresAuth     bool
}

var TierConfigs = map[UserTier]TierLimits{
    TierPlayground: {MaxCollaborators: 1, MaxProjects: 1, RequiresAuth: false},
    TierGuest:      {MaxCollaborators: 2, MaxProjects: 1, RequiresAuth: false},
    TierFree:       {MaxCollaborators: 2, MaxProjects: -1, RequiresAuth: true},  // -1 means unlimited
    TierBasic:      {MaxCollaborators: 5, MaxProjects: -1, RequiresAuth: true},
    TierStandard:   {MaxCollaborators: 10, MaxProjects: -1, RequiresAuth: true},
}