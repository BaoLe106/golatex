package files

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	// jobProvider "github.com/BaoLe106/doclean/doclean-backend/providers/job"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/gin-gonic/gin"
)

func GetFilesByProjectIdHandler(c *gin.Context) {
	projectId := c.Param("sessionId")
	result, err := GetFilesByProjectId(projectId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// fmt.Println("DEBUG::get_files", result)
	apiResponse.SendGetRequestResponse(c, http.StatusOK, result)
}

func CreateFileHandler(c *gin.Context, jobManager *JobManager, hub *wsProvider.Hub) {
	sessionId := c.Param("sessionId")
	var input CreateFilePayload

	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// fileDir := "/tmp/" + sessionId

	// Create session directory
	if err := os.MkdirAll(input.FileDir, 0755); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Create new file into session directory
	fileName := input.FileDir + "/" + input.FileName + "." + input.FileType
	file, err := os.Create(fileName)
	if err != nil {
		fmt.Println("Error here 1")
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	defer file.Close()

	// Write the content to the file
	_, err = file.WriteString(input.Content)
	if err != nil {
		fmt.Println("Error here 2")
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	fileFromDb, err := GetFileByFileId(input.FileID)
	if err != nil {
		if err != sql.ErrNoRows {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return	
		}
	}

	if (fileFromDb != nil) {
		apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
		return;
	} 

	err = CreateFile(input)
	if err != nil {
		fmt.Println("Error here 3")
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	payload := BroadcastInfoPayload{
		Hub: hub,
		SessionId: sessionId,
		InfoType: "file_created",
	}

	done := jobManager.EnqueueBroadcastCreateFileInfoToSessionJob(payload)
	if err := <-done; err != nil {
		fmt.Println("##LOG##: Error boardcasting create file info to session:", err.Error())
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}