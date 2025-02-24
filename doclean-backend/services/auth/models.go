package auth

import (
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/lestrrat-go/jwx/jwk"
) 

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

type UserSchema struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
type ConfirmUserSchema struct {
	Email    					string `json:"email" binding:"required,email"`
	ConfirmationCode 	string `json:"confirmationCode" binding:"required"`
}

type RefreshTokenSchema struct {
	Email					string `json:"email" binding:"required,email"`
	RefreshToken 	string `json:"refreshToken" binding:"required"`
}
