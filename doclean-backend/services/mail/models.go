package mail

type SendInviteMemberMailPayload struct {
	ProjectId string `json:"projectId"`
	From      string `json:"from"`
	To        string `json:"to"`
	Subject   string `json:"subject"`
	Html      string `json:"html"`
}
