package projects

import (
	"time"

	rate_limiter "github.com/BaoLe106/doclean/doclean-backend/middleware/rate_limiter"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func AddProjectRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	projectRoute := rg.Group("/project")

	projectRoute.GET("/:projectId", GetProjectInfoByProjectIdHandler)
	projectRoute.GET("/member/:projectId", GetProjectMemberHandler)
	projectRoute.POST("eSignin/:projectId", rate_limiter.RateLimitMiddleware(rate.Every(4*time.Minute/10), 10), ESignInHandler)
	projectRoute.POST("/:projectId", CreateProjectInfoHandler)
	projectRoute.PUT("/:projectId", UpdateProjectInfoHandler)
	projectRoute.DELETE("/member/:projectId/:memberId", DeleteProjectMemberHandler)
	projectRoute.DELETE("/:projectId", UpdateProjectInfoHandler)

	// router.HandleFunc("/login", h.Login).Methods("POST")

	// Protected routes (JWT middleware applied)
	// router.HandleFunc("/profile", auth.WithJWTAuth(h.Profile, h.store)).Methods("GET")
	// router.HandleFunc("/users/{userID}", auth.WithJWTAuth(h.GetUser, h.store)).Methods("GET")
}
