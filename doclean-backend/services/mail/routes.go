package mail

import (
	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/gin-gonic/gin"
)

var Svc *ses.Client

func AddMailRoutes(rg *gin.RouterGroup, cognitoAuth *auth.CognitoAuth) {
	mailRoute := rg.Group("/mail")
	Svc = ses.NewFromConfig(aws.Config{
		Region: configs.Envs.Region,
		Credentials: credentials.NewStaticCredentialsProvider(
			configs.Envs.AccessKey,
			configs.Envs.SecretAccessKey,
			"",
		),
	})

	mailRoute.POST("/invite", sendInviteMemberMailHanlder)
	mailRoute.GET("/member/:projectId", getProjectMemberHandler)

}
