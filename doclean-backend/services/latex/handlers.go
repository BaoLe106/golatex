package latex

import (
	// "encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sync"

	// "strings"
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/services/files"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)



var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (be careful with this in production)
	},
	Subprotocols: []string{"Authorization"},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}


func (h *Handler) HandleConnection(c *gin.Context, jobManager *JobManager) {
	w, r := c.Writer, c.Request
	sessionId := c.Param("sessionId")
	
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error during connection upgrade:", err)
		return
	}

	client := &Client{Conn: conn, Hub: h.Hub, SessionID: sessionId}
	h.Hub.Mutex.Lock()
	if _, exists := h.Hub.Sessions[sessionId]; !exists {
		h.Hub.Sessions[sessionId] = make(map[*Client]bool)
	}
	h.Hub.Sessions[sessionId][client] = true
	
	if data, exists := h.Hub.SessionData[sessionId]; exists {
		err := client.Conn.WriteMessage(websocket.TextMessage, []byte(data))
		
		if err != nil {
			log.Println("Error sending session data to client:", err)
		}
	}


	h.Hub.Mutex.Unlock()

	defer func() {
		h.Hub.Mutex.Lock()
		delete(h.Hub.Sessions[sessionId], client)
		if len(h.Hub.Sessions[sessionId]) == 0 {
			delete(h.Hub.Sessions, sessionId)
		}
		h.Hub.Mutex.Unlock()
		conn.Close()
	}()
	
	var timer *time.Timer
	for { //run until err then break
		_, msgBytes, err := conn.ReadMessage()
		
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}
		
		msg := string(msgBytes)

		h.Hub.Mutex.Lock()
		h.Hub.SessionData[sessionId] = msg
		
		// Only broadcast to clients in the same session
		for otherClient := range h.Hub.Sessions[sessionId] {
			if otherClient != client {
				err := otherClient.Conn.WriteMessage(websocket.TextMessage, msgBytes)
				if err != nil {
					log.Println("Error broadcasting message:", err)
					delete(h.Hub.Sessions[sessionId], otherClient)
				}
			}
		}

		h.Hub.Mutex.Unlock()

		if timer != nil {
			timer.Stop()
		}

		timer = time.AfterFunc(2 * time.Second, func() {
			if _, exists := h.Hub.Sessions[sessionId]; exists {
				sessionIdInUUID, err := uuid.Parse(sessionId)
				if err != nil {
					apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
					return
				}
				fileIdInUUID, err := uuid.Parse("826406e0-5ff3-4bed-9c58-a6cd5f052b1f")
				if err != nil {
					apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
					return
				}
				
				done := jobManager.EnqueueSaveFileContentJob(files.SaveFileContentPayload{
					FileID:       		fileIdInUUID,
					ProjectID:        sessionIdInUUID,
					Content:          msg,
					LastUpdatedBy:    uuid.New(),
				})

				go func() {
					if err := <-done; err != nil {
						fmt.Println("Error saving to DB:", err.Error())
					}
				}()

			}

		})
	}
}

type LambdaResponse struct {
	Message string `json:"message"`
	PDFFile string `json:"pdf_file"`
}

func GetFilesByProjectId(c *gin.Context) {
	projectId := c.Param("sessionId")
	result, err := files.GetFilesByProjectId(projectId)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// fmt.Println("DEBUG::get_files", result)
	apiResponse.SendGetRequestResponse(c, http.StatusOK, result)
}


func (s3Wrapper *S3ClientWrapper) CreateFile(c *gin.Context, jobManager *JobManager, hub *Hub) {
	sessionId := c.Param("sessionId")
	var input files.CreateFilePayload

	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// fileDir := "/tmp/" + sessionId

	// Create session directory
	if err := os.MkdirAll(input.FileDir, os.ModeDir); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Create new file into session directory
	fileName := input.FileDir + "/" + input.FileName + "." + input.FileType
	file, err := os.Create(fileName)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	defer file.Close()

	// Write the content to the file
	_, err = file.WriteString(input.Content)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = files.CreateFile(input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	// done := jobManager.EnqueueCreateFileJob(input)

	// if err := <-done; err != nil {
	// 	fmt.Println("Error creating file to DB:", err.Error())
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }
	
	payload := BroadcastInfoPayload{
		Hub: hub,
		SessionId: sessionId,
		InfoType: "file_created",
		// Status: "Done",
	}

	done := jobManager.EnqueueBroadcastCreateFileInfoToSessionJob(payload)
	if err := <-done; err != nil {
		fmt.Println("Error creating file to DB:", err.Error())
		// apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	apiResponse.SendPostRequestResponse(c, http.StatusCreated, nil)
}

func (s3Wrapper *S3ClientWrapper) CompileToPdf(c *gin.Context) {
	sessionId := c.Param("sessionId")

	var input CompileToPdfPayload
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	

	fileName := "/tmp/" + sessionId + "/" + input.CompileFileName + ".tex"
	// file, err := os.Create(fileName)
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }
	// defer file.Close()

	// // Write the content to the file
	// _, err = file.WriteString(input.Content)
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }

	pdfOutputPath := "/tmp/" + sessionId
	// pdfOutputFilePath := pdfOutputPath + "/sample.pdf"
	
	cmd := exec.Command("pdflatex", fmt.Sprintf("-output-directory=%s", pdfOutputPath), fileName)
	cmd.Dir = pdfOutputPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command and check for errors
	if err := cmd.Run(); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	} 

	cmd = exec.Command("bibtex", input.CompileFileName)
	cmd.Dir = pdfOutputPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command and check for errors
	if err := cmd.Run(); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	} 

	cmd = exec.Command("pdflatex", fmt.Sprintf("-output-directory=%s", pdfOutputPath), fileName)
	cmd.Dir = pdfOutputPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command and check for errors
	if err := cmd.Run(); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	} 

	cmd = exec.Command("pdflatex", fmt.Sprintf("-output-directory=%s", pdfOutputPath), fileName)
	cmd.Dir = pdfOutputPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command and check for errors
	if err := cmd.Run(); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	} 
	
	fmt.Println("PDF generated successfully!")
	
	pdfFile, err := os.Open(pdfOutputPath + "/" + input.CompileFileName + ".pdf")
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	defer pdfFile.Close()

	
	// awsConfig := aws.Config{
	// 	Region: "us-west-2",
	// 	Credentials: credentials.NewStaticCredentialsProvider(
	// 		os.Getenv("ACCESS_KEY"),
	// 		os.Getenv("SECRET_ACCESS_KEY"),
	// 		"",
	// 	),
	// }
	// s3Client := s3.NewFromConfig(awsConfig)
	// uploader := manager.NewUploader(s3Client)
	objectKey := fmt.Sprintf("output/%s/%s", sessionId , input.CompileFileName + ".pdf" )
	
	_, err = s3Wrapper.Client.PutObject(c, &s3.PutObjectInput{
	// _, err = uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(os.Getenv("S3_BUCKET")),
		Key:		aws.String(objectKey),
		Body: 	pdfFile,
	})

	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// WRITE INSERT INTO SQL WRITE INSERT INTO SQL WRITE INSERT INTO SQL
	// WRITE INSERT INTO SQL WRITE INSERT INTO SQL WRITE INSERT INTO SQL
	// WRITE INSERT INTO SQL WRITE INSERT INTO SQL WRITE INSERT INTO SQL
	// WRITE INSERT INTO SQL WRITE INSERT INTO SQL WRITE INSERT INTO SQL
	// WRITE INSERT INTO SQL WRITE INSERT INTO SQL WRITE INSERT INTO SQL

	// presignedUrl, err := s3PutObjectRes.PresignClient

	// // Read the file content and convert it to base64
	// fileAfterWriteContent, err := os.ReadFile(fileName)
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }
	// texBase64 := base64.StdEncoding.EncodeToString(fileAfterWriteContent)

	// // Set the payload for the lambda function
	// payload := AWSLambdaTexToPdfPayload{
	// 	SessionID: sessionId,
	// 	TexFilename: "sample.tex",
	// 	TexFile: texBase64,
	// }

	// // Convert payload to bytes
	// payloadBytes, err := json.Marshal(payload)
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }

	// // Invoke the lambda function
	// _, err = client.Invoke(context.TODO(), &lambda.InvokeInput{
	// 	FunctionName: aws.String("tex_to_pdf_lambda"),
	// 	Payload:      payloadBytes,
	// })
	
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }
	
	// s3Client := s3.NewFromConfig(awsConfig)
	// presignClient := s3.NewPresignClient(s3Client)

	// bucketName := "golatex--tex-and-pdf-files"
	// key := fmt.Sprintf("pdf/%s/sample.pdf", sessionId)

	presignedUrl, err := s3Wrapper.PresignClient.PresignGetObject(c, 
		&s3.GetObjectInput{
			Bucket: 										aws.String(os.Getenv("S3_BUCKET")),
			Key: 												aws.String(objectKey),
			ResponseContentType: 				aws.String("application/pdf"),
			ResponseContentDisposition: aws.String("inline"),
		},
		s3.WithPresignExpires(time.Minute * 60),
	)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"pdfUrl": presignedUrl.URL})
	// apiResponse.SendPostRequestResponse(c, http.StatusCreated, gin.H{"pdfUrl": "PDF generated successfully!"})
	
}

func (s3Wrapper *S3ClientWrapper) DownloadAllProjectFilesFromS3(c *gin.Context) {
	sessionId := c.Param("sessionId")


	// WRITE SELECT ... FROM WRITE SELECT ... FROM WRITE SELECT ... FROM  
	// WRITE SELECT ... FROM WRITE SELECT ... FROM WRITE SELECT ... FROM  
	// WRITE SELECT ... FROM WRITE SELECT ... FROM WRITE SELECT ... FROM  
	// WRITE SELECT ... FROM WRITE SELECT ... FROM WRITE SELECT ... FROM  
	// WRITE SELECT ... FROM WRITE SELECT ... FROM WRITE SELECT ... FROM  
	

	s3FolderPrefix := "tex/" + sessionId + "/"

	localDownloadPath := "/tmp/" + sessionId
	
	if err := os.MkdirAll(localDownloadPath, 0755); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	}

	listResult, err := s3Wrapper.Client.ListObjectsV2(c, &s3.ListObjectsV2Input{
		Bucket: aws.String(os.Getenv("S3_BUCKET")),
		Prefix: aws.String(s3FolderPrefix),
	})

	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var wg sync.WaitGroup

	for _, object := range listResult.Contents {
		// Skip folders themselves (objects ending with /)
		if *object.Key == s3FolderPrefix || (*object.Key)[len(*object.Key)-1] == '/' {
			continue
		}

		wg.Add(1)
		go func(key string) {
			defer wg.Done()

			// Get the filename from the key
			fileName := filepath.Base(key)
			localFilePath := filepath.Join(localDownloadPath, fileName)

			// Create the local file
			file, err := os.Create(localFilePath)
			if err != nil {
				apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
				return
			}
			defer file.Close()

			// Download the object
			result, err := s3Wrapper.Client.GetObject(c, &s3.GetObjectInput{
				Bucket: aws.String(os.Getenv("S3_BUCKET")),
				Key:    &key,
			})
			if err != nil {
				log.Printf("Failed to download file %s: %v", key, err)
				return
			}
			defer result.Body.Close()

			// Copy the object content to the local file
			_, err = io.Copy(file, result.Body)
			if err != nil {
				apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
				return
			}

			fmt.Printf("Downloaded %s to %s\n", key, localFilePath)
		}(*object.Key)
	}

	// Wait for all downloads to complete
	wg.Wait()

	// apiResponse.SendGetRequestResponse(c, http.StatusCreated, gin.H{"pdfUrl": presignedUrl.URL})
}

func CreateDocumentRecord(c *gin.Context) {

}