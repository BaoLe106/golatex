package projects

import (
	// "encoding/base64"
	"encoding/json"
	"net/http"

	// "strings"

	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/gin-gonic/gin"
)

func GetProjectInfoByProjectIdHandler(c *gin.Context) {
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

func GetProjectMemberHandler(c *gin.Context) {
	projectId := c.Param("projectId")
	// projectIdInUUID, _ := uuid.Parse(projectId)

	result, err := GetProjectMember(projectId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendGetRequestResponse(c, http.StatusOK, result)
}

func UpdateProjectInfoHandler(c *gin.Context) {
	projectId := c.Param("projectId")

	var input map[string]any
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// updates := map[string]any{
	// 	"project_share_type": input.ProjectShareType,
	// }

	err = UpdateProjectInfo(projectId, input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendPostRequestResponse(c, http.StatusNoContent, nil)
}

func DeleteProjectMemberHandler(c *gin.Context) {
	projectId := c.Param("projectId")
	memberId := c.Param("memberId")

	err := DeleteProjectMember(projectId, memberId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendPostRequestResponse(c, http.StatusNoContent, nil)
}

func ESignInHandler(c *gin.Context) {
	projectId := c.Param("projectId")
	var input map[string]any
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = GetProjectMemberByEmail(projectId, input["email"].(string))
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	apiResponse.SendPostRequestResponse(c, http.StatusNoContent, nil)
}
