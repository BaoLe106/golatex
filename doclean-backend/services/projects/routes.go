package projects

import (

	// user_tier_middleware "github.com/BaoLe106/doclean/doclean-backend/middleware/user_tier"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)

func AddProjectRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	projectRoute := rg.Group("/project")
	
	projectRoute.GET("/:projectId", GetProjectInfoByProjectIdHandler) 
	// router.HandleFunc("/login", h.Login).Methods("POST")

	// Protected routes (JWT middleware applied)
	// router.HandleFunc("/profile", auth.WithJWTAuth(h.Profile, h.store)).Methods("GET")
	// router.HandleFunc("/users/{userID}", auth.WithJWTAuth(h.GetUser, h.store)).Methods("GET")
}
