package mail

import (
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	rate_limiter "github.com/BaoLe106/doclean/doclean-backend/middleware/rate_limiter"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

var Svc *ses.Client

func AddMailRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	mailRoute := rg.Group("/mail", rate_limiter.RateLimitMiddleware(rate.Every(2*time.Minute/10), 10))
	Svc = ses.NewFromConfig(aws.Config{
		Region: configs.Envs.SESRegion,
		Credentials: credentials.NewStaticCredentialsProvider(
			configs.Envs.AccessKey,
			configs.Envs.SecretAccessKey,
			"",
		),
	})

	mailRoute.POST("/invite", sendInviteMemberMailHanlder)
}
