package main

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"github.com/rs/cors"

	"github.com/BaoLe106/doclean/doclean-backend/db"

	// jobProvider "github.com/BaoLe106/doclean/doclean-backend/providers/job"
	// redisProvider "github.com/BaoLe106/doclean/doclean-backend/providers/redis"
	s3Provider "github.com/BaoLe106/doclean/doclean-backend/providers/s3"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/BaoLe106/doclean/doclean-backend/services/files"
	"github.com/BaoLe106/doclean/doclean-backend/services/mail"

	"github.com/BaoLe106/doclean/doclean-backend/services/latex"
	"github.com/BaoLe106/doclean/doclean-backend/services/projects"

	"github.com/BaoLe106/doclean/doclean-backend/utils/helper"
	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
)

// var DB *sql.DB

func main() {
	connStr := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		configs.Envs.DBUser,
		configs.Envs.DBPassword,
		configs.Envs.DBName,
		configs.Envs.Host,
		configs.Envs.Port,
	)

	db.PostgresqlStorage(connStr)
	redisProvider.InitRedisClient()
	s3Provider.InitS3ClientWrapper(
		configs.Envs.AccessKey,
		configs.Envs.SecretAccessKey,
		configs.Envs.Region,
	)
	files.InitJobManager()

	cognitoAuth, err := auth.NewCognitoAuth(auth.CognitoConfig{
		UserPoolID: configs.Envs.UserPoolID,
		ClientID:   configs.Envs.ClientID,
		Region:     "us-west-2",
	})

	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status:  false,
			Message: err.Error(),
		})
		return
	}

	// jobProvider.InitJobManager()
	// initStorage(db)

	router := gin.Default()

	// Global middleware
	// Logger middleware will write the logs to gin.DefaultWriter even if you set with GIN_MODE=release.
	// By default gin.DefaultWriter = os.Stdout
	// router.Use(gin.Logger())

	// Recovery middleware recovers from any panics and writes a 500 if there was one.
	router.Use(gin.Recovery())

	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		bgColor := helper.ColorForStatus(param.StatusCode)
		return fmt.Sprintf("[GIN] %s - %s %d %s | %v | %s %s %s %s \"%s\"\n",
			param.TimeStamp.Format(time.RFC3339),
			bgColor, param.StatusCode, "\033[0m",
			param.Latency,
			param.ClientIP,
			"\033[46;30m", param.Method, "\033[0m",
			param.Path,
		)
	}))

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://lattex.org"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	})

	router.Use(func(c *gin.Context) {
		corsMiddleware.HandlerFunc(c.Writer, c.Request)
		c.Next()
	})

	// router.GET("/api/v1/file/:sessionId", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "hello world",
	// 	})
	// })

	apiV1 := router.Group("/api/v1")
	auth.AddAuthRoutes(apiV1, cognitoAuth)
	files.AddFileRoutes(apiV1, cognitoAuth)
	latex.AddLatexRoutes(apiV1, cognitoAuth)
	projects.AddProjectRoutes(apiV1, cognitoAuth)
	mail.AddMailRoutes(apiV1, cognitoAuth)

	// logger.BasicLogHandler(logger.BasicLogInput{
	// 	Status: true,
	// 	Message: fmt.Sprintf("Listening on %s!", ":8080"),
	// })

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "App is ready!",
		})
	})

	router.Run(":8080")
}
