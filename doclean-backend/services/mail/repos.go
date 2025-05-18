package mail

import (
	"github.com/BaoLe106/doclean/doclean-backend/db"
	"github.com/google/uuid"
)


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


// SELECT 
// 			file_id, 
// 			file_name, 
// 			file_type, 
// 			file_dir,
// 			content,
// 			origin, 
// 			last_updated_by, 
// 			last_updated_at
// 		FROM file_info 
// 		WHERE file_id = $1
func GetProjectMember(projectId uuid.UUID) (*[]ProjectMemberSchema, error) {
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