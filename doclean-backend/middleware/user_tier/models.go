package user_tier_middleware

type UserTier string

const (
    TierPlayground UserTier = "playground"
    TierGuest      UserTier = "guest"
    TierFree       UserTier = "free"
    TierBasic      UserTier = "basic"
    TierStandard   UserTier = "standard"
)

type TierLimits struct {
    MaxCollaborators int
    MaxProjects      int
    RequiresAuth     bool
}

var TierConfigs = map[UserTier]TierLimits{
    TierPlayground: {MaxCollaborators: 1, MaxProjects: 1, RequiresAuth: false},
    TierGuest:      {MaxCollaborators: 2, MaxProjects: 1, RequiresAuth: false},
    TierFree:       {MaxCollaborators: 2, MaxProjects: -1, RequiresAuth: true},  // -1 means unlimited
    TierBasic:      {MaxCollaborators: 5, MaxProjects: -1, RequiresAuth: true},
    TierStandard:   {MaxCollaborators: 10, MaxProjects: -1, RequiresAuth: true},
}