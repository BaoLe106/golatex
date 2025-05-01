package latex

// "net/http"

// "github.com/BaoLe106/doclean/doclean-backend/services/files"

type CreateFilePayload struct {
	Content   string `json:"content"`
	Extension string `json:"extension"`
	FileName  string `json:"fileName"`
}

type CompileToPdfPayload struct {
	IsThereABibFile bool   `json:"isThereABibFile"`
	CompileFileDir  string `json:"compileFileDir"`
	CompileFileName string `json:"compileFileName"`
	CompileFileType string `json:"compileFileType"`
}

type AWSLambdaTexToPdfPayload struct {
	SessionID   string `json:"sessionId"`
	TexFileName string `json:"texFileName"`
	TexFile     string `json:"texFile"`
}

// type BroadcastInfoPayload struct {
// 	Hub				*Hub		`json:"hub"`
// 	SessionId string	`json:"sessionId"`
// 	InfoType 	string  `json:"infoType"`
// 	// Data			files.GetFilesByProjectIdSchema `json:"data"`
// 	// Status 		string	`json:"status"`
// }

// func broadcastCreateFileInfoToSession(message BroadcastInfoPayload) error{
// 	message.Hub.Mutex.Lock()
// 	defer message.Hub.Mutex.Unlock()
// 	// (*files.GetFilesByProjectIdSchema,
// 	result, err := files.GetFilesByProjectId( message.SessionId)
// 	if err != nil {
// 		return err
// 	}

// 	newMessage := map[string]any {
// 		"sessionId": message.SessionId,
// 		"infoType": message.InfoType,
// 		"data": result,
// 	}
// 	msgBytes, _ := json.Marshal(newMessage)

// 	for client := range message.Hub.Sessions[message.SessionId] {
// 		err := client.Conn.WriteMessage(websocket.TextMessage, msgBytes)
// 		if err != nil {
// 			log.Println("Error broadcasting file event:", err)
// 			delete(message.Hub.Sessions[message.SessionId], client)
// 			return err
// 		}
// 	}
// 	return nil
// }

// type JobManager struct {
// 	SaveFileContentJobs chan files.SaveFileContentPayload
// 	// CreateFileJobs chan files.CreateFilePayload
// 	AfterCreateFileJobs chan BroadcastInfoPayload
// 	Errors chan error
// 	WG   sync.WaitGroup
// }

// func saveFileContentWorker(saveFileContentJobs <-chan files.SaveFileContentPayload, errors chan <- error, wg *sync.WaitGroup) {
// 	for job := range saveFileContentJobs {
// 		if err := files.SaveFileContent(job); err != nil {
// 			errors <- err
// 		} else {
// 			errors <- nil
// 		}
// 		wg.Done()
// 	}
// }

// // func createFileWorker(createFileJobs <-chan files.CreateFilePayload, errors chan <- error, wg *sync.WaitGroup) {
// // 	for job := range createFileJobs  {
// // 		if err := files.CreateFile(job); err != nil {
// // 			errors <- err
// // 		} else {
// // 			errors <- nil
// // 		}
// // 		wg.Done()
// // 	}
// // }

// func broadcastCreateFileInfoToSessionWorker(jobs <-chan BroadcastInfoPayload, errors chan <- error, wg *sync.WaitGroup) {
// 	for job := range jobs  {
// 		if err := broadcastCreateFileInfoToSession(job); err != nil {
// 			errors <- err
// 		} else {
// 			errors <- nil
// 		}
// 		wg.Done()
// 	}
// }

// func NewJobManager() *JobManager {
// 	jm := &JobManager{
// 		SaveFileContentJobs: make(chan files.SaveFileContentPayload, 10),
// 		// CreateFileJobs: make(chan files.CreateFilePayload, 10),
// 		AfterCreateFileJobs: make(chan BroadcastInfoPayload, 10),
// 		Errors: make(chan error, 10),
// 	}

// 	// for i := 1; i <= 2; i++ {
// 	go saveFileContentWorker(jm.SaveFileContentJobs, jm.Errors, &jm.WG)
// 	// go createFileWorker(jm.CreateFileJobs, jm.Errors, &jm.WG)
// 	go broadcastCreateFileInfoToSessionWorker(jm.AfterCreateFileJobs, jm.Errors, &jm.WG)
// 	// }

// 	return jm
// }
// // , JobManager: NewJobManager()
// // EnqueueJob adds a job to the queue
// func (jm *JobManager) EnqueueSaveFileContentJob(job files.SaveFileContentPayload) <- chan error{
// 	done := make(chan error, 1)
// 	jm.WG.Add(1)

// 	jm.SaveFileContentJobs <- job
// 	go func() {
// 		jm.WG.Wait()
// 		err := <-jm.Errors

// 		done <- err
// 		close(done)
// 	}()

// 	return done
// }

// // func (jm *JobManager) EnqueueCreateFileJob(job files.CreateFilePayload) <- chan error{
// // 	done := make(chan error, 1)
// // 	jm.WG.Add(1)

// // 	jm.CreateFileJobs <- job
// // 	go func() {

// // 		err := <-jm.Errors

// // 		done <- err
// // 		close(done)
// // 	}()

// // 	return done
// // }

// func (jm *JobManager) EnqueueBroadcastCreateFileInfoToSessionJob(job BroadcastInfoPayload) <- chan error{
// 	done := make(chan error, 1)
// 	jm.WG.Add(1)

// 	jm.AfterCreateFileJobs <- job
// 	go func() {
// 		// jm.WG.Wait()
// 		err := <-jm.Errors

// 		done <- err
// 		close(done)
// 	}()

// 	return done
// }

// // Close shuts down the workers
// func (jm *JobManager) Close() {
// 	close(jm.SaveFileContentJobs)
// 	// close(jm.CreateFileJobs)
// 	close(jm.AfterCreateFileJobs)
// 	close(jm.Errors)
// 	jm.WG.Wait()
// }

type UserTier string

const (
	TierPlayground UserTier = "PLAYGROUND"
	TierGuest      UserTier = "GUEST"
	TierFree       UserTier = "FREE"
	TierBasic      UserTier = "BASIC"
	TierStandard   UserTier = "STANDARD"
)

type TierLimits struct {
	MaxCollaborators int
	MaxProjects      int
	RequiresAuth     bool
}

var TierConfigs = map[UserTier]TierLimits{
	TierPlayground: {MaxCollaborators: 1, MaxProjects: 1, RequiresAuth: false},
	TierGuest:      {MaxCollaborators: 2, MaxProjects: 1, RequiresAuth: false},
	TierFree:       {MaxCollaborators: 2, MaxProjects: -1, RequiresAuth: true}, // -1 means unlimited
	TierBasic:      {MaxCollaborators: 5, MaxProjects: -1, RequiresAuth: true},
	TierStandard:   {MaxCollaborators: 10, MaxProjects: -1, RequiresAuth: true},
}
