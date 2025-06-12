package token

import (
	// "fmt"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)

func VerifyTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken, err := c.Cookie("AccessToken")
		if err != nil {
			refreshToken, err := c.Cookie("RefreshToken")
			if err != nil {
				c.AbortWithStatusJSON(403, gin.H{"error": "Unauthorized"})
				return
			}	

			newAccessToken, err := auth.RefreshTokenForESignin(refreshToken)
			if err != nil {
				// remove tokens
				auth.RemoveTokens(c)
				c.AbortWithStatusJSON(403, gin.H{"error": "Unauthorized"})
				return
			}
			
			c.SetCookie(
				"AccessToken",   // name
				*newAccessToken, // value
				7200,            // maxAge (in seconds)
				"/",             // path
				"localhost",     // domain
				false,           // secure, later on set to true in prod
				true,            // httpOnly
			)
			c.Next()
			return
		}
		_, tokenCode := auth.VerifyTokenForESignin(accessToken, []byte(configs.Envs.SecretAccessTokenESignin))
		if tokenCode == auth.EnumTokenExisting {
			c.Next()
			return
		}

		// 
		c.AbortWithStatusJSON(403, gin.H{"error": "Unauthorized"})
	}
}
