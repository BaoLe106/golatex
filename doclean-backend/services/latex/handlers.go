package latex

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

type Handler struct {
	Hub *Hub
}

func NewHandler() *Handler {
	hub := NewHub()
	go hub.Run()
	return &Handler{Hub: hub}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (be careful with this in production)
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Handler) HandleConnection(c *gin.Context) {
	w, r := c.Writer, c.Request
	sessionId := c.Param("sessionId")

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error during connection upgrade:", err)
		return
	}

	client := &Client{Conn: conn, Hub: h.Hub, SessionID: sessionId}
	h.Hub.Mutex.Lock()
	h.Hub.Clients[client] = true
	
	if data, exists := h.Hub.SessionData[sessionId]; exists {
		err := client.Conn.WriteMessage(websocket.TextMessage, []byte(data))
		
		if err != nil {
			log.Println("Error sending session data to client:", err)
		}
	}


	h.Hub.Mutex.Unlock()

	defer func() {
			h.Hub.Mutex.Lock()
			delete(h.Hub.Clients, client)
			h.Hub.Mutex.Unlock()
			conn.Close()
	}()

	for { //run until err then break
			_, msgBytes, err := conn.ReadMessage()
			
			if err != nil {
					log.Println("Error reading message:", err)
					break
			}
			
			msg := string(msgBytes)

			h.Hub.Mutex.Lock()
			h.Hub.SessionData[sessionId] = msg

			for otherClient := range h.Hub.Clients {
				if otherClient != client { // Skip the sender
					err := otherClient.Conn.WriteMessage(websocket.TextMessage, msgBytes)
					if err != nil {
						log.Println("Error broadcasting message:", err)
						delete(h.Hub.Clients, otherClient) // Clean up disconnected clients
					}
				}
			}

			h.Hub.Mutex.Unlock()
	}
}

type LambdaResponse struct {
	Message string `json:"message"`
	PDFFile string `json:"pdf_file"`
}

func CreateTexFile(c *gin.Context) {
	w, r := c.Writer, c.Request
	sessionId := c.Param("sessionId")

	// http.Error(w, "TEST ERROR", http.StatusForbidden)
	// apiResponse.SendPostRequestResponse(c, http.StatusCreated, map[string]interface{}{"firstName": "bao", "age": 10, "classes": []int{1, 2, 3}})
	// apiResponse.SendErrorResponse(c, http.StatusForbidden, "TEST ERROR")
	// return
	var input CreateTexFileInputSchema
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	godotenv.Load()
	
	awsConfig := aws.Config{
		Region: "us-west-2",
		Credentials: credentials.NewStaticCredentialsProvider(
			os.Getenv("ACCESS_KEY"),
			os.Getenv("SECRET_ACCESS_KEY"),
			"",
		),
	}
	client := lambda.NewFromConfig(awsConfig)
	
	if err := os.MkdirAll(sessionId, os.ModeDir); err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	fileName := sessionId + "/sample.tex"
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
	// Read the file content and convert it to base64
	fileAfterWriteContent, err := os.ReadFile(fileName)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	texBase64 := base64.StdEncoding.EncodeToString(fileAfterWriteContent)

	// Set the payload for the lambda function
	payload := AWSLambdaTexToPdfPayload{
		SessionID: sessionId,
		TexFilename: "sample.tex",
		TexFile: texBase64,
	}

	// Convert payload to bytes
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Invoke the lambda function
	_, err = client.Invoke(context.TODO(), &lambda.InvokeInput{
		FunctionName: aws.String("tex_to_pdf_lambda"),
		Payload:      payloadBytes,
	})
	
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	s3Client := s3.NewFromConfig(awsConfig)
	presignClient := s3.NewPresignClient(s3Client)

	bucketName := "golatex--tex-and-pdf-files"
	key := fmt.Sprintf("pdf/%s/sample.pdf", sessionId)

	presignedUrl, err := presignClient.PresignGetObject(context.Background(), 
		&s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key: aws.String(key),
			ResponseContentType: aws.String("application/pdf"),
			ResponseContentDisposition: aws.String("inline"),
		},
		s3.WithPresignExpires(time.Minute * 60),
	)
	if err != nil {
		apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	
	apiResponse.SendPostRequestResponse(c, http.StatusCreated, map[string]interface{}{"pdfUrl": presignedUrl.URL})
	
}

func CreateDocumentRecord(c *gin.Context) {

}