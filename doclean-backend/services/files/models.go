package files

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type CreateFilePayload struct {
	FileID       		uuid.UUID 	`json:"fileId"`
	ProjectID     	uuid.UUID 	`json:"projectId"`
	FileName     		string    	`json:"fileName"`
	FileType 				string    	`json:"fileType"`
	FileDir					string    	`json:"fileDir"`
	Content       	string    	`json:"content"`
	CreatedBy     	uuid.UUID 	`json:"createdBy"`
	LastUpdatedBy   uuid.UUID 	`json:"lastUpdatedBy"`
}

type SaveFileContentPayload struct {
	FileID       		uuid.UUID 	`json:"fileId"`
	ProjectID       uuid.UUID 	`json:"projectId"`
	Content         string    	`json:"content"`
	LastUpdatedBy   uuid.UUID 	`json:"lastUpdatedBy"`
}

type FileSchema struct {
	FileID       		uuid.UUID 	`json:"fileId"`
	FileName     		string    	`json:"fileName"`
	FileType 				string    	`json:"fileType"`
	FileDir 				string    	`json:"fileDir"`
	Content       	string    	`json:"content"`
	LastUpdatedBy   uuid.UUID 	`json:"lastUpdatedBy"`
	LastUpdatedAt   time.Time 	`json:"lastUpdatedAt"`
}

// Node represents a node in the file tree
type Node struct {
	FileID      uuid.UUID `json:"fileId"`
	Title   		string 		`json:"title"`
	Key     		string  	`json:"key"`
	Content 		*string		`json:"content"`
	IsLeaf  		bool    	`json:"isLeaf,omitempty"`
	Children 		[]Node 		`json:"children,omitempty"`
}

// InputItem represents the input file directory structure
type InputItem struct {
	FileID       		uuid.UUID 	`json:"fileId"`
	FileDir 				string 			`json:"fileDir"`
	FileContent			*string 		`json:"fileContent"`
}

type GetFilesByProjectIdSchema struct {
	Files 				[]FileSchema	`json:"files"`
	FileTree			[]Node				`json:"fileTree"`
}


type BroadcastInfoPayload struct {
	Hub					*wsProvider.Hub			`json:"hub"`
	SessionId 	string							`json:"sessionId"`
	InfoType 		string  						`json:"infoType"`
}

type JobManager struct {
	SaveFileContentJobs chan SaveFileContentPayload
	AfterCreateFileJobs chan BroadcastInfoPayload
	Errors chan error
	WG   sync.WaitGroup
}

var JobMngr *JobManager

func InitJobManager()  {
	jm := &JobManager{
		SaveFileContentJobs: make(chan SaveFileContentPayload, 10),
		AfterCreateFileJobs: make(chan BroadcastInfoPayload, 10),
		Errors: make(chan error, 10),
	}

	go saveFileContentWorker(jm.SaveFileContentJobs, jm.Errors, &jm.WG)
	go broadcastCreateFileInfoToSessionWorker(jm.AfterCreateFileJobs, jm.Errors, &jm.WG)

	JobMngr = jm
}

func (jm *JobManager) Close() {
	close(jm.SaveFileContentJobs)
	close(jm.AfterCreateFileJobs)
	close(jm.Errors)
	jm.WG.Wait()
}

func broadcastCreateFileInfoToSession(message BroadcastInfoPayload) error{
	message.Hub.Mutex.Lock()
	defer message.Hub.Mutex.Unlock()

	fmt.Println("##LOG##: Boardcasting: ", message.InfoType)
	result, err := GetFilesByProjectId(message.SessionId)
	if err != nil {
		return err
	}

	newMessage := map[string]any {
		"sessionId": message.SessionId,
		"infoType": message.InfoType,
		"data": result,
	}
	msgBytes, _ := json.Marshal(newMessage)

	for client := range message.Hub.Sessions[message.SessionId] {
		err := client.Conn.WriteMessage(websocket.TextMessage, msgBytes)
		fmt.Println("##LOG##: write msg")
		if err != nil {
			log.Println("Error broadcasting file event:", err)
			delete(message.Hub.Sessions[message.SessionId], client)
			return err
		}
	}
	return nil
}

func broadcastCreateFileInfoToSessionWorker(jobs <-chan BroadcastInfoPayload, errors chan <- error, wg *sync.WaitGroup) {
	for job := range jobs  {
		if err := broadcastCreateFileInfoToSession(job); err != nil {
			errors <- err
		} else {
			errors <- nil
		}
		wg.Done()
	}
}


func saveFileContentWorker(saveFileContentJobs <-chan SaveFileContentPayload, errors chan <- error, wg *sync.WaitGroup) {
	for job := range saveFileContentJobs {
		if err := SaveFileContent(job); err != nil {
			errors <- err
		} else {

			errors <- nil
		}
		wg.Done()
	}
}

// EnqueueJob adds a job to the queue
func (jm *JobManager) EnqueueSaveFileContentJob(job SaveFileContentPayload) <- chan error{
	done := make(chan error, 1)
	jm.WG.Add(1)
	
	jm.SaveFileContentJobs <- job
	go func() {
		jm.WG.Wait()
		err := <-jm.Errors

		done <- err
		close(done)
	}()

	return done
}

func (jm *JobManager) EnqueueBroadcastCreateFileInfoToSessionJob(job BroadcastInfoPayload) <- chan error{
	done := make(chan error, 1)
	jm.WG.Add(1)
	
	jm.AfterCreateFileJobs <- job
	go func() {
		err := <-jm.Errors

		done <- err
		close(done)
	}()

	return done
}