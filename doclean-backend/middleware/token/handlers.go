package token

import (
	"fmt"
	"time"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	project_enum "github.com/BaoLe106/doclean/doclean-backend/enum"
	"github.com/golang-jwt/jwt/v4"

	// "github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)

func removeTokens(c *gin.Context) {
	c.SetCookie(
		"AccessToken", // name
		"",            // value
		-1,            // maxAge (in seconds)
		"/",           // path
		"lattex.org",   // domain
		true,         // secure, later on set to true in prod
		true,          // httpOnly
	)
	c.SetCookie(
		"RefreshToken", // name
		"",             // value
		-1,             // maxAge (in seconds)
		"/",            // path
		"lattex.org",    // domain
		true,          // secure, later on set to true in prod
		true,           // httpOnly
	)
}

func verifyTokenForESignin(tokenString string, secretKey []byte) (*jwt.Token, int) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		// Check if the error is due to expiration
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorExpired != 0 {
				return nil, EnumTokenExpired
			}
		}
		return nil, EnumTokenError
	}

	if !token.Valid {
		return nil, EnumTokenError
	}

	return token, EnumTokenExisting
}

func refreshTokenForESignin(refreshToken string) (*string, error) {
	token, tokenCode := verifyTokenForESignin(refreshToken, []byte(configs.Envs.SecretRefreshTokenESignin))
	if tokenCode != EnumTokenExisting {
		return nil, fmt.Errorf("token expired, login again")
	}

	// claims token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}
	email := claims["email"].(string)

	accessToken := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": email,
			"exp":   time.Now().Add(time.Hour * 2).Unix(),
		},
	)

	var accessTokenSecret = []byte(configs.Envs.SecretAccessTokenESignin)
	accessTokenString, err := accessToken.SignedString(accessTokenSecret)
	if err != nil {
		return nil, err
	}

	return &accessTokenString, nil
}

func VerifyTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectId := c.Param("projectId")
		fmt.Println("#DEBUG::projectId", projectId)
		// projectShareType, exists := c.Get(projectId)
		// fmt.Println("#DEBUG::projectShareType", projectShareType)
		
		// if exists && projectShareType != 2 {
		// 	removeTokens(c)
		// 	c.Next()
		// 	return
		// }

		project, err := GetProjectInfoByProjectId(projectId)
		if err != nil {
			fmt.Println("#DEBUG::err in get proj info", err)
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}
		fmt.Println("#DEBUG::projectShareType", project.ProjectShareType)
		if project.ProjectShareType == project_enum.PROJECT_SHARE_TYPE_EVERYONE {
			removeTokens(c)
			c.Next()
			return
		}
		c.Set(projectId, project.ProjectShareType)

		accessToken, err := c.Cookie("AccessToken")
		fmt.Println("#DEBUG::accessToken", accessToken)
		if err != nil {
			refreshToken, err := c.Cookie("RefreshToken")
			fmt.Println("#DEBUG::refreshToken", refreshToken)
			if err != nil {
				c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
				return
			}
			fmt.Println("#DEBUG::here_after_refresh_token")
			newAccessToken, err := refreshTokenForESignin(refreshToken)
			if err != nil {
				// remove tokens
				removeTokens(c)
				c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
				return
			}

			c.SetCookie(
				"AccessToken",   // name
				*newAccessToken, // value
				7200,            // maxAge (in seconds)
				"/",             // path
				"lattex.org",     // domain
				true,           // secure, later on set to true in prod
				true,            // httpOnly
			)
			c.Next()
			return
		}
		_, tokenCode := verifyTokenForESignin(accessToken, []byte(configs.Envs.SecretAccessTokenESignin))
		if tokenCode == EnumTokenExisting {
			c.Next()
			return
		}

		//
		c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
	}
}
