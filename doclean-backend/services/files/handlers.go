package files

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	// jobProvider "github.com/BaoLe106/doclean/doclean-backend/providers/job"
	s3Provider "github.com/BaoLe106/doclean/doclean-backend/providers/s3"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

	// File existed, don't create file, just write file to disk
	if fileFromDb != nil {
		apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
		return
	}

	err = CreateFile(input)
	if err != nil {
		fmt.Println("Error here 3")
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var fileNameBroadcast string
	if input.FileType != "folder" {
		fileNameBroadcast = input.FileName + "." + input.FileType
	} else {
		fileNameBroadcast = input.FileName
	}

	payload := BroadcastInfoPayload{
		Hub:       hub,
		SessionId: sessionId,
		InfoType:  "file_created",
		FileName:  fileNameBroadcast,
		FileType:  input.FileType,
	}

	done := jobManager.EnqueueBroadcastCreateFileInfoToSessionJob(payload)
	if err := <-done; err != nil {
		fmt.Println("##LOG##: Error boardcasting create file info to session:", err.Error())
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}

func UploadFileHandler(c *gin.Context, jobManager *JobManager, hub *wsProvider.Hub) {
	sessionId := c.Param("sessionId")
	form, err := c.MultipartForm()
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	currentFolder := form.Value["currentFolder"][0]
	currentPeerId := form.Value["currentPeerId"][0]
	files := form.File["files"]

	// input: fileName, fileType,
	fileDir := "/tmp/" + sessionId + currentFolder
	// Create session upload directory
	if err := os.MkdirAll(fileDir, 0755); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	for _, fileHeader := range files {
		// Open the file (returns multipart.File)
		file, err := fileHeader.Open()
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		defer file.Close()

		// Example: Get metadata for AWS S3
		fileName := fileHeader.Filename

		// Build full path: fileDir + filename
		fileDestinationPath := filepath.Join(fileDir+"/", fileHeader.Filename)

		// Create file destination
		fileDestination, err := os.Create(fileDestinationPath)
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}

		// Save to local disk
		_, err = io.Copy(fileDestination, file)
		fileDestination.Close()
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}

		// Write to DB: file_info table

		// Upload to S3 — reopen or reset src before reuse
		// Example: uploadToS3(fileHeader, filename, contentType)
		file.Seek(0, io.SeekStart) // Reset reader position
		contentType := fileHeader.Header.Get("Content-Type")
		fmt.Println("#DEBUG::contentType", contentType)
		s3Client := s3Provider.S3Client

		objectKey := fmt.Sprintf("input/%s%s/%s", sessionId, currentFolder, fileName)
		fmt.Println("#DEBUG::objectKey", objectKey)
		_, err = s3Client.Client.PutObject(c, &s3.PutObjectInput{
			// _, err = uploader.Upload(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String(os.Getenv("S3_BUCKET")),
			Key:         aws.String(objectKey),
			Body:        file, //*os.File
			ContentType: aws.String(contentType),
		})

		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		file.Seek(0, io.SeekStart) // Reset reader position
		mtype, err := mimetype.DetectReader(file)
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}

		fmt.Println("#DEBUG::mtype", mtype)
		content := ""
		file.Seek(0, io.SeekStart) // Reset reader position - IMPORTANT
		if strings.HasPrefix(mtype.String(), "text/") {
			contentBytes, err := io.ReadAll(file)
			if err != nil {
				apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
				return
			}

			content = string(contentBytes)
		}

		// fmt.Println("#DEBUG::content_from_upload_file", content)
		projectId, _ := uuid.Parse(sessionId)
		fileType := filepath.Ext(fileName)
		fileName = fileName[:len(fileName)-len(fileType)]
		fileType = fileType[1:]
		currentPeerUUID, _ := uuid.Parse(currentPeerId)

		err = CreateFile(CreateFilePayload{
			FileID:        uuid.New(),
			ProjectID:     projectId,
			FileName:      fileName,
			FileType:      fileType,
			FileDir:       fileDir,
			CreatedBy:     currentPeerUUID,
			LastUpdatedBy: currentPeerUUID,
			Content:       content,
			Origin:        1,
		})
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
	}
	payload := BroadcastInfoPayload{
		Hub:       hub,
		SessionId: sessionId,
		InfoType:  "file_uploaded",
	}

	done := jobManager.EnqueueBroadcastCreateFileInfoToSessionJob(payload)
	if err := <-done; err != nil {
		fmt.Println("##LOG##: Error boardcasting create file info to session:", err.Error())
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}
