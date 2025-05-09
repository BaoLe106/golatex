package files

import (
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)



func AddFileRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	fileRoute := rg.Group("/file")

	jobManager := JobMngr

	fileRoute.GET("/:sessionId", GetFilesByProjectIdHandler)
	fileRoute.POST("/:sessionId", 
		func(ctx *gin.Context) {
			CreateFileHandler(ctx, jobManager, wsProvider.Handler.Hub)
		},
		
	)
}