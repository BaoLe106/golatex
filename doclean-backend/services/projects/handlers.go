package projects

import (
	// "encoding/base64"

	"encoding/json"
	"net/http"

	// "strings"

	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/gin-gonic/gin"
)

func GetProjectInfoByProjectIdHandler (c *gin.Context) {
	projectId := c.Param("projectId")
	

	project, err := GetProjectInfoByProjectId(projectId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendGetRequestResponse(c, http.StatusOK, project)
}


func CreateProjectInfoHandler(c *gin.Context) {
	projectId := c.Param("projectId")

	var input CreateProjectPayload

	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = CreateProjectInfo(projectId, input.ProjectTier)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}