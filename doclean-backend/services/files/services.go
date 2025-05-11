package files

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"

	s3Provider "github.com/BaoLe106/doclean/doclean-backend/providers/s3"
	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/gorilla/websocket"
)

func broadcastCreateFileInfoToSessionWork(message BroadcastInfoPayload) error {
	message.Hub.Mutex.RLock()
	defer message.Hub.Mutex.RUnlock()

	fmt.Println("##LOG##: Boardcasting: ", message.InfoType)
	result, err := GetFilesByProjectId(message.SessionId)
	if err != nil {
		return err
	}

	var newMessage wsProvider.SignalingMessage
	switch message.InfoType {
	case "file_created":
		newMessage = wsProvider.SignalingMessage{
			Type:           message.InfoType,
			SessionID:      message.SessionId,
			CreateFileData: result,
			AdditionalData: map[string]string{
				"fileName": message.FileName,
				"fileType": message.FileType,
			},
		}
	case "file_uploaded":
		newMessage = wsProvider.SignalingMessage{
			Type:           message.InfoType,
			SessionID:      message.SessionId,
			CreateFileData: result,
		}
	case "update_content_with_file": 
		newMessage = wsProvider.SignalingMessage{
			Type:           message.InfoType,
			SessionID:      message.SessionId,
			CreateFileData: result,
		}
	default:

	}

	msgBytes, _ := json.Marshal(newMessage)

	// Check if session exists
	sessionPeers, exists := message.Hub.Sessions[message.SessionId]
	if !exists {
		return fmt.Errorf("session %s not found", message.SessionId)
	}

	// Broadcast to all peers in the session
	for peerId, conn := range sessionPeers {
		if err := conn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
			log.Printf("Error broadcasting to peer %s: %v", peerId, err)

			// Upgrade to write lock if we need to remove the peer
			message.Hub.Mutex.RUnlock()
			message.Hub.Mutex.Lock()
			delete(message.Hub.Sessions[message.SessionId], peerId)
			if len(message.Hub.Sessions[message.SessionId]) == 0 {
				delete(message.Hub.Sessions, message.SessionId)
				delete(message.Hub.SessionData, message.SessionId)
			}
			message.Hub.Mutex.Unlock()
			message.Hub.Mutex.RLock()

			continue
		}
	}

	return nil
}


func CreateFileOnLocalWork(file CreateFileOnLocalJobPayload) error {
	fmt.Println("debug u here")
	if err := os.MkdirAll(file.FileDir, 0755); err != nil {	
		return err
	}

	// Create new file into session directory
	fileName := file.FileDir + "/" + file.FileName + "." + file.FileType
	osFile, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer osFile.Close()

	// osFile.Seek(0, io.SeekStart) // Reset reader position
	// mtype, err := mimetype.DetectReader(osFile)
	// if err != nil {
	// 	apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
	// 	return
	// }

	// fmt.Println("#DEBUG::mime", mtype.String())
	if file.Content != "" {
		// Write the content to the file
		_, err = osFile.WriteString(file.Content)
		if err != nil {
			return err
		}	
	} else if file.FileType == "png" || file.FileType == "pdf" {
		objectKey := fmt.Sprintf("input/%s/%s", file.ProjectID, file.FileName + "." + file.FileType)
		resp, err := s3Provider.S3Client.Client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(os.Getenv("S3_BUCKET")),
			Key:    aws.String(objectKey),
		})
		if err != nil {
			return err
			// log.Fatalf("failed to get object from S3: %v", err)
		}
		defer resp.Body.Close()

		_, err = io.Copy(osFile, resp.Body)
		if err != nil {
			return err
		}


		// presignedUrl, err := s3Provider.S3Client.PresignClient.PresignGetObject(
		// 	c,
		// 	&s3.GetObjectInput{
		// 		Bucket:                     aws.String(os.Getenv("S3_BUCKET")),
		// 		Key:                        aws.String(objectKey),
		// 		ResponseContentType:        aws.String("image/png"),
		// 		ResponseContentDisposition: aws.String("inline"),
		// 	},
		// 	s3.WithPresignExpires(time.Minute*60),
		// )
		// if err != nil {
		// 	return err
		// }

	}
	return nil
}