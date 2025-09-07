package projects

import (
	"errors"
	"fmt"
	"strings"

	"github.com/BaoLe106/doclean/doclean-backend/db"
	"github.com/google/uuid"
)

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

func CreateProjectInfo(projectId string, projectTier string, projectShareType int) error {
	// sessionId = project_id

	_, err := db.DB.Exec(`
		INSERT INTO project_info (
			project_id,
			project_name,
			project_tier,
			project_share_type,
			created_by,
			created_at,
			last_updated_by,
			last_updated_at
		) VALUES (
			$1,	$2,	$3,	$4, $5, NOW(), $6, NOW()
		) ON CONFLICT (project_id) DO UPDATE SET
			project_name = EXCLUDED.project_name,
			last_updated_by = EXCLUDED.last_updated_by,
			last_updated_at = NOW();
	`, projectId, projectId, projectTier, projectShareType, projectId, projectId)

	return err
}

func CreateProjectMember(input CreateProjectMemberPayload) error {
	_, err := db.DB.Exec(`
		INSERT INTO project_member (
			id,
			project_id, 
			email,
			created_by,
			created_at, 
			last_updated_by,
			last_updated_at
		) VALUES (
			$1,	$2,	$3,	$4, NOW(), $5, NOW()
		) 
	`, input.Id, input.ProjectId, input.Email, input.UserId, input.UserId)

	return err
}

func GetProjectMemberByEmail(projectId string, email string) error {
	var count int
	err := db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM project_member
		WHERE project_id = $1
		AND email = $2
	`, projectId, email).Scan(&count)

	if err != nil {
		return err
	}

	if count == 0 {
		return fmt.Errorf("no record found")
	}

	return nil
}

func GetProjectMember(projectId string) (*[]ProjectMemberSchema, error) {
	result, err := db.DB.Query(`
		SELECT  
			id,
			project_id, 
			email
		FROM project_member
		WHERE project_id = $1 
	`, projectId)

	if err != nil {
		return nil, err
	}

	defer result.Close()
	projectMembers := []ProjectMemberSchema{}
	for result.Next() {
		var member ProjectMemberSchema
		if err := result.Scan(
			&member.Id,
			&member.ProjectId,
			&member.Email,
		); err != nil {
			return nil, err
		}

		projectMembers = append(projectMembers, member)
	}

	return &projectMembers, nil
}

func DeleteProjectMember(projectId string, memberId string) error {
	_, err := db.DB.Exec(`
		DELETE FROM project_member 
		WHERE project_id = $1 AND id = $2
	`, projectId, memberId)

	return err
}

func UpdateProjectInfo(projectId string, data map[string]any) error {
	if len(data) == 0 {
		return errors.New("no updates provided")
	}

	setClauses := []string{}
	args := []any{}
	argIndex := 1

	for col, val := range data {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, argIndex))
		args = append(args, val)
		argIndex++
	}

	// WHERE clause
	args = append(args, projectId)
	query := fmt.Sprintf("UPDATE project_info SET %s WHERE project_id = $%d",
		strings.Join(setClauses, ", "), argIndex)

	_, err := db.DB.Exec(query, args...)
	return err
}
