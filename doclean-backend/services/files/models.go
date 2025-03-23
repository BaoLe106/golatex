package files

import (
	"time"

	"github.com/google/uuid"
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
	Title   	string  `json:"title"`
	Key     	string  `json:"key"`
	Content 	*string	`json:"content"`
	IsLeaf  	bool    `json:"isLeaf,omitempty"`
	Children 	[]Node 	`json:"children,omitempty"`
}

// InputItem represents the input file directory structure
type InputItem struct {
	FileDir 				string 			`json:"fileDir"`
	FileContent			*string 		`json:"fileContent"`
}

type GetFilesByProjectIdSchema struct {
	Files 				[]FileSchema	`json:"files"`
	FileTree			[]Node				`json:"fileTree"`
}