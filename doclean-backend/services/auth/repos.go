package auth

import (
	"fmt"
	"strings"

	"github.com/BaoLe106/doclean/doclean-backend/db"
)

// UserId 								uuid.UUID 	`json:"userId"`
// 	UserTier 							string			`json:"userTier"`
// 	SubcriptionEndTime		time.Time 	`json:"subcriptionEndTime"`
// 	Email									string			`json:"email"`
// 	Password							string			`json:"password"`
// 	CreatedAt   					time.Time 	`json:"createdAt"`
// 	LastUpdatedAt   			time.Time 	`json:"lastUpdatedAt"`

func CreateUserInfo(userInfo UserInfoPayload) error {
	_, err := db.DB.Exec(`
		INSERT INTO user_info (
			user_id,
			user_tier,
			subscription_end_time,
			email,
			password,
			is_confirmed,
			created_at,
			last_updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	`, 
		userInfo.UserId,
		userInfo.UserTier,
		userInfo.SubscriptionEndTime,
		userInfo.Email,
		userInfo.Password,
		userInfo.IsConfirmed,
	)

	return err
}
// UserId 								uuid.UUID 		`json:"userId"`
// 	UserTier 							string				`json:"userTier"`
// 	SubcriptionEndTime		*time.Time 		`json:"subcriptionEndTime"`
// 	Email									string				`json:"email"`
// 	Password							string				`json:"password"`
// 	IsConfirmed						bool					`json:"isConfirmed"`
// 	CreatedAt   					time.Time 		`json:"createdAt"`
// 	LastUpdatedAt   			time.Time 		`json:"lastUpdatedAt"`
func GetUserInfoByUserEmail(email string) (*UserInfoSchema, error) {
	result := db.DB.QueryRow(`
		SELECT 
			user_id,
			user_tier,
			subscription_end_time,
			email,
			is_confirmed,
			created_at,
			last_updated_at
		FROM user_info
		WHERE email = $1
	`, email)

	userInfo := UserInfoSchema{}

	err := result.Scan(
		&userInfo.UserId, 
		&userInfo.UserTier,
		&userInfo.SubscriptionEndTime,
		&userInfo.Email,
		// &userInfo.Password,
		&userInfo.IsConfirmed,
		&userInfo.CreatedAt,
		&userInfo.LastUpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &userInfo, nil
}

func UpdateUserInfo(email string, updates map[string]any) error {
	if len(updates) == 0 {
		return fmt.Errorf("no updates provided")
	}
	
	// Build the SQL query dynamically
	setClauses := []string{}
	values := []interface{}{}
	paramIndex := 1

	for column, value := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", column, paramIndex))
		values = append(values, value)
		paramIndex++
	}

	query := fmt.Sprintf("UPDATE user_info SET %s WHERE email = $%d", strings.Join(setClauses, ", "), paramIndex)
	values = append(values, email)

	_, err := db.DB.Exec(query, values...)
	

	return err
}