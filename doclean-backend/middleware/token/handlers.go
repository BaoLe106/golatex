package token

import (
	"fmt"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/services/auth"
	"github.com/gin-gonic/gin"
)

func VerifyTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken, err := c.Cookie("AccessToken")
		fmt.Println("debug accessToken", accessToken)
		if err != nil {
			fmt.Println("debug err", err)
			c.AbortWithStatusJSON(403, gin.H{"error": "Unauthorized"})
			return
		}
		_, tokenCode := auth.VerifyTokenForESignin(accessToken, []byte(configs.Envs.SecretAccessTokenESignin))
		if tokenCode == auth.EnumTokenExisting {
			c.Next()
			return
		}

		refreshToken, _ := c.Cookie("RefreshToken")
		newAccessToken, err := auth.RefreshTokenForESignin(refreshToken)
		if err != nil {
			c.SetCookie(
				"AccessToken", // name
				"",            // value
				-1,            // maxAge (in seconds)
				"/",           // path
				"localhost",   // domain
				false,         // secure, later on set to true in prod
				true,          // httpOnly
			)
			c.SetCookie(
				"RefreshToken", // name
				"",             // value
				-1,             // maxAge (in seconds)
				"/",            // path
				"localhost",    // domain
				false,          // secure, later on set to true in prod
				true,           // httpOnly
			)
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
	}
}
