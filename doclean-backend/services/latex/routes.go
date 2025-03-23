package latex

import (
	"os"

	// user_tier_middleware "github.com/BaoLe106/doclean/doclean-backend/middleware/user_tier"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)

// jobs := make(chan interface{}, 10)

// wg := sync.WaitGroup{}

func AddLatexRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	s3Wrapper := NewS3ClientWrapper(
		os.Getenv("ACCESS_KEY"),
		os.Getenv("SECRET_ACCESS_KEY"),
		os.Getenv("REGION"),
	)




	latexRoute := rg.Group("/latex")
	latexHandler := NewHandler()

	jobManager := NewJobManager()
	
	latexRoute.Use(
		auth.TierMiddleware(auth.TierFree, cognitoAuth),
		// user_tier_middleware.ProjectLimitMiddleware(),
	)

	latexRoute.GET("/:sessionId", 
		// CollaborationLimitMiddleware(latexHandler),
		// WebSocketAuthMiddleware(cognitoAuth),
		func(ctx *gin.Context) {
			latexHandler.HandleConnection(ctx, jobManager)
		},
	)
	
	// latexRoute.GET("/session", SessionHandler)
	// latexRoute.GET("/:sessionId", latexHandler.HandleConnection)
	latexRoute.GET("/file/:sessionId", GetFilesByProjectId)
		
	latexRoute.POST("/file/:sessionId", 
		func(ctx *gin.Context) {
			s3Wrapper.CreateFile(ctx, jobManager, latexHandler.Hub)
		},
		
	)
	latexRoute.POST("/pdf/:sessionId", s3Wrapper.CompileToPdf)
}

