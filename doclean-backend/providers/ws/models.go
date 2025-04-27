package wsProvider

import (
	"sync"

	// "github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type MsgData struct {
	FileID				string 	`json:"fileId"`
	FileContent		string 	`json:"fileContent"`
}

type Hub struct {
	Sessions 		map[string]map[*Client]bool
	Broadcast 	chan string
	Mutex 			sync.Mutex
	SessionData map[string]string
}

type Client struct {
	Conn 			*websocket.Conn
	// Hub  			*Hub
	SessionID string
}

func NewHub() *Hub {
	return &Hub{
			Sessions:   	make(map[string]map[*Client]bool),
			Broadcast: 		make(chan string),
			SessionData: 	make(map[string]string),
	}
}
type HandlerStruct struct {
	Hub *Hub
	// JobManager *JobManager
}

