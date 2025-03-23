package projects

import (
	// "encoding/base64"

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