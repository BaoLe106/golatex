package latex

import (
	// user_tier_middleware "github.com/BaoLe106/doclean/doclean-backend/middleware/user_tier"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)


func AddLatexRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	latexRoute := rg.Group("/latex")
	latexHandler := NewHandler()

	
	
	latexRoute.GET("/:sessionId", 
		// CollaborationLimitMiddleware(latexHandler),
		WebSocketAuthMiddleware(cognitoAuth),
		latexHandler.HandleConnection,
	)
	latexRoute.Use(
		TierMiddleware(TierFree, cognitoAuth),
		// user_tier_middleware.ProjectLimitMiddleware(),
	)
	// latexRoute.GET("/session", SessionHandler)
	// latexRoute.GET("/:sessionId", latexHandler.HandleConnection)
	latexRoute.POST("/tex/:sessionId", CreateTexFile)
}

