package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func PostgresqlStorage(connStr string) (*sql.DB, error) {

	// connStr := "postgresql://172.26.149.249:5432/doclean-db"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	return db, nil
	
}