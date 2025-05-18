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

type GetProjectInfoByProjectIdPayload struct {
	ProjectID uuid.UUID `json:"projectId"`
}

type CreateProjectPayload struct {
	ProjectTier string `json:"projectTier"`
}
