package latex

import (
	// "encoding/base64"
	"bytes"
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

	// jobProvider "github.com/BaoLe106/doclean/doclean-backend/providers/job"
	s3Provider "github.com/BaoLe106/doclean/doclean-backend/providers/s3"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"

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


func HandleConnection(c *gin.Context, jobManager *files.JobManager) {
	w, r := c.Writer, c.Request
	
	sessionId := c.Param("sessionId")
	
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error during connection upgrade:", err)
		return
	}

	client := &wsProvider.Client{Conn: conn, SessionID: sessionId}
	wsProvider.Handler.Hub.Mutex.Lock()
	if _, exists := wsProvider.Handler.Hub.Sessions[sessionId]; !exists {
		wsProvider.Handler.Hub.Sessions[sessionId] = make(map[*wsProvider.Client]bool)
	}
	wsProvider.Handler.Hub.Sessions[sessionId][client] = true
	
	if data, exists := wsProvider.Handler.Hub.SessionData[sessionId]; exists {
		err := client.Conn.WriteMessage(websocket.TextMessage, []byte(data))
		
		if err != nil {
			log.Println("Error sending session data to client:", err)
		}
	}


	wsProvider.Handler.Hub.Mutex.Unlock()

	defer func() {
		wsProvider.Handler.Hub.Mutex.Lock()
		delete(wsProvider.Handler.Hub.Sessions[sessionId], client)
		if len(wsProvider.Handler.Hub.Sessions[sessionId]) == 0 {
			delete(wsProvider.Handler.Hub.Sessions, sessionId)
		}
		wsProvider.Handler.Hub.Mutex.Unlock()
		conn.Close()
	}()
	
	var timer *time.Timer
	for { //run until err then break
		_, msgBytes, err := conn.ReadMessage()
		
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		var msgData wsProvider.MsgData
		msg := string(msgBytes)
		err = json.Unmarshal(msgBytes, &msgData)
		if err != nil {
			log.Println("Error unmarshalling message:", err)
		}
		
		wsProvider.Handler.Hub.Mutex.Lock()
		wsProvider.Handler.Hub.SessionData[sessionId] = msg
		
		// Only broadcast to clients in the same session
		for otherClient := range wsProvider.Handler.Hub.Sessions[sessionId] {
			var tmpMsgData wsProvider.MsgData
			err = json.Unmarshal(msgBytes, &tmpMsgData)
			if err != nil {
				log.Println("Error unmarshalling message:", err)
			}
			fmt.Println("##LOG client1##:", client)
			fmt.Println("##LOG client2##:", otherClient)
			fmt.Println("##LOG msgData3##:", tmpMsgData)
			if otherClient != client {
				err := otherClient.Conn.WriteMessage(websocket.TextMessage, msgBytes)
				fmt.Println("##LOG##: write msg in main")
				if err != nil {
					log.Println("Error broadcasting message:", err)
					delete(wsProvider.Handler.Hub.Sessions[sessionId], otherClient)
				}
			}
		}

		wsProvider.Handler.Hub.Mutex.Unlock()

		if timer != nil {
			timer.Stop()
		}
		
		timer = time.AfterFunc(2 * time.Second, func() {
			if _, exists := wsProvider.Handler.Hub.Sessions[sessionId]; exists {
				sessionIdInUUID, err := uuid.Parse(sessionId)
				if err != nil {
					apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
					return
				}

				fileIdInUUID, _ := uuid.Parse(msgData.FileID)
				// if err != nil {
				// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
				// 	return
				// }
				
				done := jobManager.EnqueueSaveFileContentJob(files.SaveFileContentPayload{
					FileID:       		fileIdInUUID,
					ProjectID:        sessionIdInUUID,
					Content:          msgData.FileContent,
					LastUpdatedBy:    uuid.New(),
				})

				go func() {
					if err := <-done; err != nil {
						fmt.Println("Error saving to DB:", err.Error())
						return
					}


					payload := files.BroadcastInfoPayload{
						Hub: wsProvider.Handler.Hub,
						SessionId: sessionId,
						InfoType: "file_content_saved",
						// Status: "Done",
					}
				
					done = jobManager.EnqueueBroadcastCreateFileInfoToSessionJob(payload)
					
					if err := <-done; err != nil {
						fmt.Println("Error creating file to DB:", err.Error())
					}
				}()

				
				
			}

		})
	}
}

// type LambdaResponse struct {
// 	Message string `json:"message"`
// 	PDFFile string `json:"pdf_file"`
// }






func CompileToPdf(c *gin.Context) {
	sessionId := c.Param("sessionId")

	s3Client := s3Provider.S3Client

	var input CompileToPdfPayload
	err := json.NewDecoder(c.Request.Body).Decode(&input)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	if input.CompileFileType != "tex" {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, "File type not supported")
		return
	}

	fileName := input.CompileFileDir + "/" + input.CompileFileName + "." + input.CompileFileType
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
	var stderr bytes.Buffer
	cmd.Stdout = &stderr
	cmd.Stderr = os.Stderr

	// Run the command and check for errors
	if err := cmd.Run(); err != nil {
		// errorMessage := fmt.Sprintf("pdflatex error: %s\n\nDetails: %s", err.Error(), )
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, stderr.String())
		return
	} 
	

	if input.IsThereABibFile {
		cmd = exec.Command("bibtex", input.CompileFileName)
		cmd.Dir = pdfOutputPath
		cmd.Stdout = &stderr
		cmd.Stderr = os.Stderr

		// Run the command and check for errors
		if err := cmd.Run(); err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, stderr.String())
			return
		} 

		cmd = exec.Command("pdflatex", fmt.Sprintf("-output-directory=%s", pdfOutputPath), fileName)
		cmd.Dir = pdfOutputPath
		cmd.Stdout = &stderr
		cmd.Stderr = os.Stderr

		// Run the command and check for errors
		if err := cmd.Run(); err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, stderr.String())
			return
		} 

		cmd = exec.Command("pdflatex", fmt.Sprintf("-output-directory=%s", pdfOutputPath), fileName)
		cmd.Dir = pdfOutputPath
		cmd.Stdout = &stderr
		cmd.Stderr = os.Stderr

		// Run the command and check for errors
		if err := cmd.Run(); err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, stderr.String())
			return
		} 
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
	
	_, err = s3Client.Client.PutObject(c, &s3.PutObjectInput{
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

	presignedUrl, err := s3Client.PresignClient.PresignGetObject(c, 
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

func DownloadAllProjectFilesFromS3(c *gin.Context) {
	sessionId := c.Param("sessionId")
	s3Client := s3Provider.S3Client

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

	listResult, err := s3Client.Client.ListObjectsV2(c, &s3.ListObjectsV2Input{
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
			result, err := s3Client.Client.GetObject(c, &s3.GetObjectInput{
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