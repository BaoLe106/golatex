package main

import (
	"database/sql"
	"fmt"

	"github.com/BaoLe106/doclean/doclean-backend/cmd/api"
	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/db"
	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)


func main() {
	connStr := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		configs.Envs.DBUser, 
		configs.Envs.DBPassword, 
		configs.Envs.DBName, 
		configs.Envs.Host, 
		configs.Envs.Port,
	)

	db, err := db.PostgresqlStorage(connStr)
	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
		return;
	}
	initStorage(db)
	server := api.NewAPIServer(":8080")
	if err := server.Run(); err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
		return;
	}
}

func initStorage(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
		return;
	}

	logger.BasicLogHandler(logger.BasicLogInput{
		Status: true,
		Message: "DB: Successfully connected!",
	})
}