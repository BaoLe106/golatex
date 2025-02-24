package auth

import (
	// user_tier_middleware "github.com/BaoLe106/doclean/doclean-backend/middleware/user_tier"
	"github.com/gin-gonic/gin"
)


func AddAuthRoutes(rg *gin.RouterGroup, cognitoAuth *CognitoAuth) {
	authRoute := rg.Group("/auth")
	// authHandler := NewHandler()

	// authRoute.Use(
	// 	TierMiddleware(TierGuest, cognitoAuth),
	// 	// user_tier_middleware.ProjectLimitMiddleware(),
	// )
	authRoute.POST("/refresh", cognitoAuth.RefreshToken)
	authRoute.POST("/signup", cognitoAuth.SignUp)
	authRoute.POST("/signin", cognitoAuth.SignIn)
	authRoute.POST("/confirmSignup", cognitoAuth.ConfirmSignUp)
	// CollaborationLimitMiddleware(latexHandler), latexHandler.HandleConnection)
	// latexRoute.GET("/:sessionId", latexHandler.HandleConnection)
	// latexRoute.POST("/tex/:sessionId", CreateTexFile)
}
