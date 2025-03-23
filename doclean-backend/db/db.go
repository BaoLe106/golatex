package db

import (
	"database/sql"

	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func PostgresqlStorage(connStr string) {
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
		return;
	}

	err = DB.Ping()
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
	return
}


// func initStorage(db *sql.DB) {
// 	err := db.Ping()
// 	if err != nil {
// 		logger.BasicLogHandler(logger.BasicLogInput{
// 			Status: false,
// 			Message: err.Error(),
// 		})
// 		return;
// 	}

// 	logger.BasicLogHandler(logger.BasicLogInput{
// 		Status: true,
// 		Message: "DB: Successfully connected!",
// 	})
// }