package token

import (
	"fmt"
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/db"
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

func GetProjectInfoByProjectId(projectId string) (*ProjectSchema, error) {
	result := db.DB.QueryRow(`
		SELECT 
			project_id,
			project_name,
			project_tier,
			project_share_type,
			last_updated_by,
			last_updated_at
		FROM project_info
		WHERE project_id = $1
	`, projectId)

	project := ProjectSchema{}
	fmt.Println("debug result in query project info", result)
	err := result.Scan(&project.ProjectID, &project.ProjectName, &project.ProjectTier, &project.ProjectShareType, &project.LastUpdatedBy, &project.LastUpdatedAt)
	if err != nil {
		fmt.Println("error in query project info", err)
		return nil, err
	}

	return &project, nil
}
