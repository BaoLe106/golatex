package auth

import (
	"time"

	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/jwk"
) 


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
    TierFree:       {MaxCollaborators: 2, MaxProjects: -1, RequiresAuth: true},  // -1 means unlimited
    TierBasic:      {MaxCollaborators: 5, MaxProjects: -1, RequiresAuth: true},
    TierStandard:   {MaxCollaborators: 10, MaxProjects: -1, RequiresAuth: true},
}

type CognitoConfig struct {
	UserPoolID string
	ClientID   string
	Region     string
}

type CognitoAuth struct {
	config     CognitoConfig
	cognitoSvc *cognitoidentityprovider.Client
	jwksURL    string
	keySet     jwk.Set
}

// UserId: uuid.New(),
// 		UserTier: "FREE",
// 		SubscriptionEndTime: nil,
// 		Email: user.Email,
// 		Password: encryptedPassword,
// 		IsConfirmed: false,

type UserInfoPayload struct {
	UserId 								uuid.UUID 		`json:"userId"`
	UserTier 							string				`json:"userTier"`
	SubscriptionEndTime		*time.Time 		`json:"subscriptionEndTime"`
	Email									string				`json:"email"`
	Password							string				`json:"password"`
	IsConfirmed						bool					`json:"isConfirmed"`
}

type UserInfoSchema struct {
	UserId 								uuid.UUID 		`json:"userId"`
	UserTier 							string				`json:"userTier"`
	SubscriptionEndTime		*time.Time 		`json:"subscriptionEndTime"`
	Email									string				`json:"email"`
	IsConfirmed						bool					`json:"isConfirmed"`
	CreatedAt   					time.Time 		`json:"createdAt"`
	LastUpdatedAt   			time.Time 		`json:"lastUpdatedAt"`
}

type UserPayload struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
type ConfirmUserPayload struct {
	Email    					string `json:"email" binding:"required,email"`
	ConfirmationCode 	string `json:"confirmationCode" binding:"required"`
}

type RefreshTokenPayload struct {
	Email					string `json:"email" binding:"required,email"`
	RefreshToken 	string `json:"refreshToken" binding:"required"`
}
