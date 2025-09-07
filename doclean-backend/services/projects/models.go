package projects

import (
	"time"

	"github.com/google/uuid"
)

type ProjectSchema struct {
	ProjectID        uuid.UUID  `json:"projectId"`
	ProjectName      string     `json:"projectName"`
	ProjectTier      string     `json:"projectTier"`
	ProjectShareType int        `json:"projectShareType"` //0 -> no share; 1 -> everyone; 2 -> specific
	LastUpdatedBy    *uuid.UUID `json:"lastUpdatedBy"`
	LastUpdatedAt    time.Time  `json:"lastUpdatedAt"`
}

type ProjectMemberSchema struct {
	Id        uuid.UUID `json:"id"`
	ProjectId uuid.UUID `json:"projectId"`
	Email     string    `json:"email"`
}
type CreateProjectMemberPayload struct {
	Id        uuid.UUID `json:"id"`
	ProjectId string    `json:"projectId"`
	UserId    uuid.UUID `json:"userId"`
	Email     string    `json:"email"`
}

type GetProjectInfoByProjectIdPayload struct {
	ProjectID uuid.UUID `json:"projectId"`
}

type CreateProjectPayload struct {
	ProjectTier 			string `json:"projectTier"`
	ProjectShareType 	int 		`json:"projectShareType"`
}

// type ChangeProjectShareTypePayload struct {
// 	ProjectID        uuid.UUID `json:"projectId"`
// 	ProjectShareType int       `json:"projectShareType"` //0 -> no share; 1 -> everyone; 2 -> specific
// }
