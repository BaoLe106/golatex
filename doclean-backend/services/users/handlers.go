package users

import (
	"fmt"
	"net/http"

	// "strconv"
	// "encoding/json"

	"github.com/go-playground/validator/v10"

	// "github.com/gorilla/mux"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/BaoLe106/doclean/doclean-backend/utils"
)

type Handler struct {
	store UserStore
}

func NewHandler(store UserStore) *Handler {
	return &Handler{store: store}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var userReq RegisterUserPayload
	if err := utils.ParseJSON(r, &userReq); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if err := utils.Validate.Struct(userReq); err != nil {
		errors := err.(validator.ValidationErrors)
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid payload: %v", errors))
		return
	}

	// check if user exists
	// _, err := h.store.GetUserByEmail(userReq.Email)
	// if err == nil {
	// 	utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("user with email %s already exists", user.Email))
	// 	return
	// }

	// Hash the password
	hashedPassword, err := auth.HashPassword(userReq.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	user := &User{
		Username: userReq.Username,
		Email:    userReq.Email,
		Password: string(hashedPassword),
	}

	// Store the user in the database
	if err := h.store.CreateUser(*user); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, nil)
}

// func (h *Handler) RegisterRoutes(router *mux.Router) {
// 	router.HandleFunc("/login", h.handleLogin).Methods("POST")
// 	router.HandleFunc("/register", h.handleRegister).Methods("POST")
// }
