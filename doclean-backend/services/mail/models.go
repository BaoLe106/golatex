package mail

import "github.com/google/uuid"

type ProjectMemberSchema struct {
	Id        uuid.UUID `json:"id"`
	ProjectId uuid.UUID	`json:"projectId"`
	Email     string		`json:"email"`
}

type SendInviteMemberMailPayload struct {
	ProjectId uuid.UUID `json:"projectId"`
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Html    string `json:"html"`
}

type CreateProjectMemberPayload struct {
	Id        uuid.UUID `json:"id"`
	ProjectId uuid.UUID	`json:"projectId"`
	UserId    uuid.UUID	`json:"userId"`
	Email     string		`json:"email"`
}