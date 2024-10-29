package users

import (
	// "github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gorilla/mux"
)

func (h *Handler) RegisterRoutes(router *mux.Router) {
	// Public routes
	router.HandleFunc("/register", h.Register).Methods("POST")
	// router.HandleFunc("/login", h.Login).Methods("POST")

	// Protected routes (JWT middleware applied)
	// router.HandleFunc("/profile", auth.WithJWTAuth(h.Profile, h.store)).Methods("GET")
	// router.HandleFunc("/users/{userID}", auth.WithJWTAuth(h.GetUser, h.store)).Methods("GET")
}
