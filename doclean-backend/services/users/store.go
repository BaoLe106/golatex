package users

import (
	"database/sql"
)

// type User struct {
//     ID    int    `json:"id"`
//     Email string `json:"email"`
// }

//	type UserStore interface {
//	    GetUserByID(id int) (*User, error)
//	}
type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) CreateUser(user User) error {
	_, err := s.db.Exec("INSERT INTO users (userName, email, password) VALUES (?, ?, ?)", user.Username, user.Email, user.Password)
	if err != nil {
		return err
	}

	return nil
}
