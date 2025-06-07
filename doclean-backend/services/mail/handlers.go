package mail

import (
	"encoding/json"
	"net/http"

	"github.com/BaoLe106/doclean/doclean-backend/services/projects"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/google/uuid"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/gin-gonic/gin"

	// "github.com/aws/aws-sdk-go-v2/aws/session"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
	// "github.com/aws/aws-sdk-go-v2/aws/awserr"
)

func sendInviteMemberMailHanlder(c *gin.Context) {
	var input SendInviteMemberMailPayload
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	projectMembers, err := projects.GetProjectMember(input.ProjectId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	if len(*projectMembers) >= 3 {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, "No record found")
		return
	}

	mailInput := &ses.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: []string{
				input.To,
			},
		},
		Message: &types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(input.Html),
				},
			},
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String(input.Subject),
			},
		},
		Source: aws.String(input.From),
	}

	result, err := Svc.SendEmail(c, mailInput)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id := uuid.New()
	id2 := uuid.New()
	err = projects.CreateProjectMember(projects.CreateProjectMemberPayload{
		Id:        id,
		ProjectId: input.ProjectId,
		UserId:    id2,
		Email:     input.To,
	})
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"messageId": result.MessageId})
}
