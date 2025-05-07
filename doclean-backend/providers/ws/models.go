package wsProvider

import (
	"sync"

	// "github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type SignalingMessage struct {
	Type              string                `json:"type"`
	SessionID         string                `json:"sessionId"`
	PeerID            string                `json:"peerId"`
	ToPeerID          string                `json:"toPeerId,omitempty"`
	UpdateContentData UpdateContentDataType `json:"updateContentData,omitempty"`
	CreateFileData    any                   `json:"createFileData,omitempty"`
	AdditionalData    any                   `json:"additionalData,omitempty"`
}

type SignalingServer struct {
	Hub      *Hub
	Sessions map[string]map[string]*websocket.Conn // sessionID -> peerID -> conn
	Mutex    sync.RWMutex
}

func NewSignalingServer(hub *Hub) *SignalingServer {
	return &SignalingServer{
		Hub:      hub,
		Sessions: make(map[string]map[string]*websocket.Conn),
	}
}

type UpdateContentDataType struct {
	FileID      string `json:"fileId"`
	FileContent string `json:"fileContent"`
}

type Hub struct {
	Sessions    map[string]map[string]*websocket.Conn // sessionID -> peerID -> conn
	Broadcast   chan string
	Mutex       sync.RWMutex
	SessionData map[string]string
}

type Client struct {
	Conn *websocket.Conn
	// Hub  			*Hub
	SessionID string
}

func NewHub() *Hub {
	return &Hub{
		Sessions:    make(map[string]map[string]*websocket.Conn),
		Broadcast:   make(chan string),
		SessionData: make(map[string]string),
	}
}

type HandlerStruct struct {
	Hub *Hub
	// JobManager *JobManager
}
