package main

import (
	"database/sql"
	// "fmt"
	"log"

	"github.com/BaoLe106/doclean/doclean-backend/cmd/api"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	// "github.com/BaoLe106/doclean/doclean-backend/configs"
	// "github.com/BaoLe106/doclean/doclean-backend/db"
)


func main() {
	// connStr := fmt.Sprintf(
	// 	"user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
	// 	configs.Envs.DBUser, 
	// 	configs.Envs.DBPassword, 
	// 	configs.Envs.DBName, 
	// 	configs.Envs.Host, 
	// 	configs.Envs.Port,
	// )

	// db, err := db.PostgresqlStorage(connStr)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// initStorage(db)
	server := api.NewAPIServer(":8080")
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

func initStorage(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("DB: Successfully connected!")
}