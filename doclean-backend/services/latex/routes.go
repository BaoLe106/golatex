package latex

import (
	// "os"

	// user_tier_middleware "github.com/BaoLe106/doclean/doclean-backend/middleware/user_tier"
	// jobProvider "github.com/BaoLe106/doclean/doclean-backend/providers/job"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/BaoLe106/doclean/doclean-backend/services/files"

	// "github.com/BaoLe106/doclean/doclean-backend/ws"
	"github.com/gin-gonic/gin"
)

// jobs := make(chan interface{}, 10)

// wg := sync.WaitGroup{}

func AddLatexRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	latexRoute := rg.Group("/latex")
	wsProvider.NewHandler()
	jobManager := files.JobMngr
	// jobManager := NewJobManager()
	latexRoute.GET("/playground/:sessionId",
		// CollaborationLimitMiddleware(latexHandler),
		// WebSocketAuthMiddleware(cognitoAuth),
		func(ctx *gin.Context) {
			HandleConnection(ctx, jobManager)
		},
	)

	// latexRoute.Use(
	// 	auth.TierMiddleware(cognitoAuth),
	// 	// user_tier_middleware.ProjectLimitMiddleware(),
	// )

	latexRoute.GET("/:sessionId",
		// CollaborationLimitMiddleware(latexHandler),
		// WebSocketAuthMiddleware(cognitoAuth),
		func(ctx *gin.Context) {
			HandleConnection(ctx, jobManager)
		},
	)

	// latexRoute.GET("/session", SessionHandler)
	// latexRoute.GET("/:sessionId", latexHandler.HandleConnection)

	latexRoute.POST("/pdf/:sessionId", CompileToPdf)
}
