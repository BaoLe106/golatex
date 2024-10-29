package api

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/BaoLe106/doclean/doclean-backend/services/users"
	"github.com/gorilla/mux"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
	return &APIServer{
		addr: addr,
		db:   db,
	}
}

func (server *APIServer) Run() error {
	router := mux.NewRouter()
	subrouter := router.PathPrefix("/api/v1").Subrouter()
	userStore := users.NewStore(server.db)
	userHandler := users.NewHandler(userStore)
	userHandler.RegisterRoutes(subrouter)
	log.Println("Listening on", server.addr)
	return http.ListenAndServe(server.addr, router)
}

