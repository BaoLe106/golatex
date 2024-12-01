package doc

import (
	"github.com/gorilla/mux"
)

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/doc/{sessionId}", h.HandleConnection).Methods("GET")
}

