package latex

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/gorilla/mux"
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

func (h *Handler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionID"] 
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error during connection upgrade:", err)
		return
	}

	client := &Client{Conn: conn, Hub: h.Hub, SessionID: sessionID}
	h.Hub.Mutex.Lock()
	h.Hub.Clients[client] = true
	
	if data, exists := h.Hub.SessionData[sessionID]; exists {
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
			h.Hub.SessionData[sessionID] = msg

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

func CreateTexFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionId := vars["sessionId"]
	fmt.Println("#DEBUG::r.URL", r.URL)
	var input CreateTexFileInputSchema
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		// message := "Invalid input"
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
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
	
	if err := os.Mkdir(sessionId, os.ModeDir); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
		return
	}

	fileName := sessionId + "/sample.tex"
	file, err := os.Create(fileName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
		return
	}
	defer file.Close()

	// Write the content to the file
	_, err = file.WriteString(input.Content)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
		return
	}
	// Read the file content and convert it to base64
	fileAfterWriteContent, err := os.ReadFile(fileName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
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
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
		return
	}

	// Invoke the lambda function
	response, err := client.Invoke(context.TODO(), &lambda.InvokeInput{
		FunctionName: aws.String("tex_to_pdf_lambda"),
		Payload:      payloadBytes,
	})
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		logger.LogHandler(logger.LogInput{
			StatusCode: http.StatusBadRequest,
			Message: err.Error(),
			ApiUrl: r.URL,
		})
		return
	}
	
	logger.LogHandler(logger.LogInput{
		StatusCode: http.StatusCreated,
		ApiUrl: r.URL,
	})
	w.Write(response.Payload)
	
}