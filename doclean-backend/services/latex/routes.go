package latex

import (
	"github.com/gorilla/mux"
)

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/latex/{sessionId}", h.HandleConnection).Methods("GET")
}

