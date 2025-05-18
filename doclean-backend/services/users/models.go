package users

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        int       `json:"ID" db:"ID" auto_increment:"true"`
	UUID      uuid.UUID `json:"uuid" db:"uuid" primary_key:"true"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type LoginUserPayload struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=130"`
}

// type RegisterUserPayload struct {
// 	FirstName string `json:"firstName" validate:"required"`
// 	LastName  string `json:"lastName" validate:"required"`
// 	Email     string `json:"email" validate:"required,email"`
// 	Password  string `json:"password" validate:"required,min=3,max=130"`
// }

type UserStore interface {
	// GetUserByEmail(email string) (*User, error)
	// GetUserByID(id int) (*User, error)
	CreateUser(User) error
}
