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
