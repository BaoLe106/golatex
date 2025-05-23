package configs

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Host        		string
	Port						string
	DBUser					string
	DBPassword			string
	// DBAddress		string
	DBName					string
	UserPoolID			string
	ClientID				string
	ClientSecret		string
	AccessKey 			string
	SecretAccessKey string
	Region 					string
	RedisAddr				string
	RedisUsername		string
	RedisPassword 	string
	// JWTSecret              string
	// JWTExpirationInSeconds int64
}

var Envs = initConfig()

func initConfig() Config {
	godotenv.Load(".env.dev")
	return Config{
		Host:								getEnv("HOST", "http://localhost"),
		Port:								getEnv("PORT", "5000"),
		DBUser:							getEnv("DB_USER", "admin"),
		DBPassword:					getEnv("DB_PASSWORD", "mypassword"),
		// DBAddress:		fmt.Sprintf("%s:%s", getEnv("DB_HOST", "127.0.0.1"), getEnv("DB_PORT", "3306")),
		DBName:							getEnv("DB_NAME", "golatex"),
		UserPoolID:					getEnv("USER_POOL_ID", "default"),
		ClientID:						getEnv("CLIENT_ID", "default"),
		ClientSecret: 			getEnv("CLIENT_SECRET", "default"),

		AccessKey:					getEnv("ACCESS_KEY", "default"),
		SecretAccessKey:		getEnv("SECRET_ACCESS_KEY", "default"),
		Region:							getEnv("REGION", "default"),

		RedisAddr:					getEnv("REDIS_ADDR", ""),
		RedisUsername:			getEnv("REDIS_USERNAME", "default"),
		RedisPassword:			getEnv("REDIS_PASSWORD", ""),
		// JWTSecret:              getEnv("JWT_SECRET", "not-so-secret-now-is-it?"),
		// JWTExpirationInSeconds: getEnvAsInt("JWT_EXPIRATION_IN_SECONDS", 3600 * 24 * 7),
	}
}

// Gets the env by key or fallbacks
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}