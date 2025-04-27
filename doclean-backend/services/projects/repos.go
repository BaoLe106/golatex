package projects

import (
	"github.com/BaoLe106/doclean/doclean-backend/db"
	"github.com/google/uuid"
) 

func GetProjectInfoByProjectId(projectId string) (*ProjectSchema, error){
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
	
	err := result.Scan(&project.ProjectID, &project.ProjectName, &project.ProjectTier, &project.ProjectShareType, &project.LastUpdatedBy, &project.LastUpdatedAt)
	if err != nil {
		return nil, err
	}

	return &project, nil
}

func CreateProjectOwner(projectId uuid.UUID, userId uuid.UUID, email string) error {
	// sessionId = project_id

	_, err := db.DB.Exec(`
		INSERT INTO project_owner (
			project_id, 
			user_id, 
			email,
			created_at, 
			last_updated_at
		) VALUES (
			$1,	$2,	$3,	NOW(), NOW()
		) ON CONFLICT (project_id) DO UPDATE SET
			project_name = EXCLUDED.project_name,
			last_updated_by = EXCLUDED.last_updated_by,
			last_updated_at = NOW();
	`, projectId, "user_id", "user_id")

	return err
}

func CreateProjectInfo(projectId string, projectTier string) error {
	// sessionId = project_id
	
	_, err := db.DB.Exec(`
		INSERT INTO project_info (
			project_id,
			project_name,
			project_tier,
			created_by,
			created_at,
			last_updated_by,
			last_updated_at
		) VALUES (
			$1,	$2,	$3,	$4, NOW(), $5, NOW()
		) ON CONFLICT (project_id) DO UPDATE SET
			project_name = EXCLUDED.project_name,
			last_updated_by = EXCLUDED.last_updated_by,
			last_updated_at = NOW();
	`, projectId, projectId, projectTier, projectId, projectId)

	return err
}
