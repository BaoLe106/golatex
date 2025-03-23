package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	// "github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/BaoLe106/doclean/doclean-backend/services/latex"
	"github.com/BaoLe106/doclean/doclean-backend/services/projects"
	"github.com/BaoLe106/doclean/doclean-backend/utils/helper"
	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string) *APIServer {
	return &APIServer{
		addr: addr,
		// db:   db,
	}
}

func (server *APIServer) Run() error {
	router := gin.New()

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
		AllowedOrigins: 	[]string{"http://localhost:3006"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	})
	// router := mux.NewRouter()
	router.Use(func(c *gin.Context) {
		corsMiddleware.HandlerFunc(c.Writer, c.Request)
		c.Next()
	})

	cognitoAuth, err := auth.NewCognitoAuth(auth.CognitoConfig{
		UserPoolID: configs.Envs.UserPoolID,
		ClientID:   configs.Envs.ClientID,
		Region:     "us-west-2",
	})
	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
	}

	apiV1 := router.Group("/api/v1");
	latex.AddLatexRoutes(apiV1, cognitoAuth)
	auth.AddAuthRoutes(apiV1, cognitoAuth)
	projects.AddProjectRoutes(apiV1, cognitoAuth)
	
	logger.BasicLogHandler(logger.BasicLogInput{
		Status: true,
		Message: fmt.Sprintf("Listening on %s!", server.addr),
	})
	return http.ListenAndServe(server.addr, corsMiddleware.Handler(router))
}

