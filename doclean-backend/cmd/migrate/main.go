package main

import (
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/db"
)

func main() {
	connStr := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%s",
		configs.Envs.DBUser, 
		configs.Envs.DBPassword, 
		configs.Envs.DBName, 
		configs.Envs.Host, 
		configs.Envs.Port,
	)

	db, err := db.PostgresqlStorage(connStr)
	if err != nil {
		log.Fatal(err)
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	m, err := migrate.NewWithDatabaseInstance(
		"file:///migrations",
		"postgres", driver,
	)

	if err != nil {
		log.Fatal(err)
	}

	v, d, _ := m.Version()
	log.Printf("Version: %d, dirty: %v", v, d)

	cmd := os.Args[len(os.Args)-1]
	if cmd == "up" {
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}
	}
	if cmd == "down" {
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}
	}
}