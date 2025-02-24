package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/lestrrat-go/jwx/jwk"
)

// NewCognitoAuth creates a new instance of CognitoAuth
func NewCognitoAuth(cfg CognitoConfig) (*CognitoAuth, error) {
	// Load AWS configuration
	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(cfg.Region),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %v", err)
	}

	// Create Cognito service client
	cognitoSvc := cognitoidentityprovider.NewFromConfig(awsCfg)

	// Construct JWKS URL
	jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json",
		cfg.Region, cfg.UserPoolID)

	// Fetch the JWKS (JSON Web Key Set)
	keySet, err := jwk.Fetch(context.Background(), jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %v", err)
	}

	return &CognitoAuth{
		config:     cfg,
		cognitoSvc: cognitoSvc,
		jwksURL:    jwksURL,
		keySet:     keySet,
	}, nil
}

// ValidateToken validates the JWT token from Cognito
func (ca *CognitoAuth) ValidateToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid header not found")
		}

		key, ok := ca.keySet.LookupKeyID(kid)
		if !ok {
			return nil, fmt.Errorf("key %v not found", kid)
		}

		var rawKey interface{}
		if err := key.Raw(&rawKey); err != nil {
			return nil, fmt.Errorf("failed to get raw key: %v", err)
		}

		return rawKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	// Validate claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	// Verify token use
	if tokenUse, ok := claims["token_use"].(string); !ok || tokenUse != "access" {
		return nil, errors.New("invalid token use")
	}

	// Verify client ID
	if aud, ok := claims["client_id"].(string); !ok || aud != ca.config.ClientID {
		return nil, errors.New("invalid client id")
	}

	return token, nil
}

// Middleware for protecting routes
func (ca *CognitoAuth) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Authorization header required")

			// c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			// 	"error": "Authorization header required",
			// })
			return
		}

		// Extract the token from the Authorization header
		tokenParts := strings.Split(authHeader, "Bearer ")
		if len(tokenParts) != 2 {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format")
			// c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			// 	"error": "Invalid authorization header format",
			// })
			return
		}
		tokenString := tokenParts[1]

		// Validate the token
		token, err := ca.ValidateToken(tokenString)
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Invalid token")
			// c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			// 	"error": "Invalid token",
			// })
			return
		}

		// Store the validated token in the Gin context
		c.Set("token", token)

		// Optional: Extract and store user claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", claims["sub"])
			c.Set("email", claims["email"])
			// Add any other claims you want to access in your handlers
		}

		c.Next()
	}
}