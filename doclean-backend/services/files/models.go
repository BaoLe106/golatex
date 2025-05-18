package files

import (
	"sync"
	"time"

	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/google/uuid"
)

type CreateFilePayload struct {
	FileID        uuid.UUID `json:"fileId"`
	ProjectID     uuid.UUID `json:"projectId"`
	FileName      string    `json:"fileName"`
	FileType      string    `json:"fileType"`
	FileDir       string    `json:"fileDir"`
	Content       string    `json:"content"`
	CreatedBy     uuid.UUID `json:"createdBy"`
	LastUpdatedBy uuid.UUID `json:"lastUpdatedBy"`
	Origin        int       `json:"origin"` //0 -> create from app; 1 -> import from local then upload to s3
}

type SaveFileContentPayload struct {
	FileID        uuid.UUID `json:"fileId"`
	ProjectID     uuid.UUID `json:"projectId"`
	Content       string    `json:"content"`
	LastUpdatedBy uuid.UUID `json:"lastUpdatedBy"`
}

type CreateFileOnLocalJobPayload struct {
	ProjectID string    `json:"projectId"`
	FileID    uuid.UUID `json:"fileId"`
	FileName  string    `json:"fileName"`
	FileType  string    `json:"fileType"`
	FileDir   string    `json:"fileDir"`
	Content   string    `json:"content"`
}

type FileSchema struct {
	FileID        uuid.UUID `json:"fileId"`
	FileName      string    `json:"fileName"`
	FileType      string    `json:"fileType"`
	FileDir       string    `json:"fileDir"`
	Content       string    `json:"content"`
	Origin        int       `json:"origin"`
	LastUpdatedBy uuid.UUID `json:"lastUpdatedBy"`
	LastUpdatedAt time.Time `json:"lastUpdatedAt"`
}

// Node represents a node in the file tree
type Node struct {
	FileID   uuid.UUID `json:"fileId"`
	Title    string    `json:"title"`
	Key      string    `json:"key"`
	Content  *string   `json:"content"`
	IsLeaf   bool      `json:"isLeaf,omitempty"`
	Children []Node    `json:"children,omitempty"`
}

// InputItem represents the input file directory structure
type InputItem struct {
	FileID      uuid.UUID `json:"fileId"`
	FileDir     string    `json:"fileDir"`
	FileContent *string   `json:"fileContent"`
}

type GetFilesByProjectIdSchema struct {
	Files    []FileSchema `json:"files"`
	FileTree []Node       `json:"fileTree"`
}

type BroadcastInfoPayload struct {
	Hub       *wsProvider.Hub `json:"hub"`
	SessionId string          `json:"sessionId"`
	InfoType  string          `json:"infoType"`
	FileName  string          `json:"fileName,omitempty"`
	FileType  string          `json:"fileType,omitempty"`
	// UpdateContentData wsProvider.UpdateContentDataType `json:"updateContentData,omitempty"`
}

type JobManager struct {
	SaveFileContentJobs   chan SaveFileContentPayload
	AfterCreateFileJobs   chan BroadcastInfoPayload
	CreateFileOnLocalJobs chan CreateFileOnLocalJobPayload
	Errors                chan error
	WG                    sync.WaitGroup
}

var JobMngr *JobManager

func InitJobManager() {
	jm := &JobManager{
		SaveFileContentJobs:   make(chan SaveFileContentPayload, 10),
		AfterCreateFileJobs:   make(chan BroadcastInfoPayload, 10),
		CreateFileOnLocalJobs: make(chan CreateFileOnLocalJobPayload, 10),
		Errors:                make(chan error, 10),
	}

	go saveFileContentWorker(jm.SaveFileContentJobs, jm.Errors, &jm.WG)
	go broadcastCreateFileInfoToSessionWorker(jm.AfterCreateFileJobs, jm.Errors, &jm.WG)
	go createFileOnLocalWorker(jm.CreateFileOnLocalJobs, jm.Errors, &jm.WG)
	JobMngr = jm
}

func (jm *JobManager) Close() {
	close(jm.SaveFileContentJobs)
	close(jm.AfterCreateFileJobs)
	close(jm.Errors)
	jm.WG.Wait()
}

func broadcastCreateFileInfoToSessionWorker(jobs <-chan BroadcastInfoPayload, errors chan<- error, wg *sync.WaitGroup) {
	for job := range jobs {
		if err := broadcastCreateFileInfoToSessionWork(job); err != nil {
			errors <- err
		} else {
			errors <- nil
		}
		wg.Done()
	}
}

func saveFileContentWorker(saveFileContentJobs <-chan SaveFileContentPayload, errors chan<- error, wg *sync.WaitGroup) {
	for job := range saveFileContentJobs {
		if err := SaveFileContent(job); err != nil {
			errors <- err
		} else {
			errors <- nil
		}
		wg.Done()
	}
}

func createFileOnLocalWorker(createFileOnLocalJobs <-chan CreateFileOnLocalJobPayload, errors chan<- error, wg *sync.WaitGroup) {
	for job := range createFileOnLocalJobs {
		if err := CreateFileOnLocalWork(job); err != nil {
			errors <- err
		} else {

			errors <- nil
		}
		wg.Done()
	}
}

func (jm *JobManager) EnqueueBroadcastCreateFileInfoToSessionJob(job BroadcastInfoPayload) <-chan error {
	done := make(chan error, 1)
	jm.WG.Add(1)

	jm.AfterCreateFileJobs <- job
	go func() {
		//possibly optional
		// jm.WG.Wait()
		// possibly optional
		err := <-jm.Errors

		done <- err
		close(done)
	}()

	return done
}

// EnqueueJob adds a job to the queue
func (jm *JobManager) EnqueueSaveFileContentJob(job SaveFileContentPayload) <-chan error {
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

func (jm *JobManager) EnqueueCreateFileOnLocalJob(job CreateFileOnLocalJobPayload) <-chan error {
	done := make(chan error, 1)
	jm.WG.Add(1)

	jm.CreateFileOnLocalJobs <- job
	go func() {
		jm.WG.Wait()
		err := <-jm.Errors

		done <- err
		close(done)
	}()

	return done
}
