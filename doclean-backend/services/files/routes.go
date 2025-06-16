package files

import (
	"time"

	rate_limiter "github.com/BaoLe106/doclean/doclean-backend/middleware/rate_limiter"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func AddFileRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	fileRoute := rg.Group("/file")

	jobManager := JobMngr

	fileRoute.GET("/:sessionId",
		func(ctx *gin.Context) {
			GetFilesByProjectIdHandler(ctx, jobManager)
		},
	)
	fileRoute.POST("/:sessionId", rate_limiter.RateLimitMiddleware(rate.Every(1*time.Minute/10), 10),
		func(ctx *gin.Context) {
			CreateFileHandler(ctx, jobManager, wsProvider.Handler.Hub)
		},
	)
	fileRoute.POST("/upload/:sessionId", rate_limiter.RateLimitMiddleware(rate.Every(1*time.Minute/10), 10),
		func(ctx *gin.Context) {
			UploadFileHandler(ctx, jobManager, wsProvider.Handler.Hub)
		},
	)
	fileRoute.POST("download", DownloadFileHandler)
	fileRoute.DELETE("/:sessionId/:fileId",
		func(ctx *gin.Context) {
			DeleteFileHandler(ctx, jobManager, wsProvider.Handler.Hub)
		},
	)
}
