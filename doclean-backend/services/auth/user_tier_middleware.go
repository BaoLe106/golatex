package auth

import (
	"net/http"
	"strings"

	wsProvider "github.com/BaoLe106/doclean/doclean-backend/providers/ws"
	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"
	"github.com/golang-jwt/jwt/v4"

	// "github.com/BaoLe106/doclean/doclean-backend/services/latex"
	"github.com/gin-gonic/gin"
)

func TierMiddleware(cognitoAuth *CognitoAuth) gin.HandlerFunc {
	return func(c *gin.Context) {

		idToken, err := c.Cookie("IdToken")
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Authorization header required")
			return
		}

		validatedIdToken, err := cognitoAuth.ValidateToken(idToken)
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Optional: Extract and store user claims
		claims, ok := validatedIdToken.Claims.(jwt.MapClaims)
		if !ok {
			apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Invalid token")
			return
		}

		userInfo, err := GetUserInfoByUserEmail(claims["email"].(string))
		if err != nil {
			apiResponse.SendErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}

		limits := TierConfigs[UserTier(userInfo.UserTier)]

		// Store tier information in context
		c.Set("userTier", UserTier(userInfo.UserTier))
		c.Set("tierLimits", limits)

		// Check if authentication is required for this tier
		if limits.RequiresAuth {
			// Use the Cognito middleware for authenticated tiers
			// auth.NewCognitoAuth()
			cognitoAuth.AuthMiddleware()(c)
			if c.IsAborted() {
				return
			}
		}

		c.Next()
	}
}

// type LatexHandler struct {
//     *latex.Handler
// }

// func (h *LatexHandler) getCollaboratorCount(sessionID string) int {
//     h.Hub.Mutex.Lock()
//     defer h.Hub.Mutex.Unlock()

//     if clients, exists := h.Hub.Sessions[sessionID]; exists {
//         return len(clients)
//     }
//     return 0
// }

func WebSocketAuthMiddleware(cognitoAuth *CognitoAuth) gin.HandlerFunc {
	return func(c *gin.Context) {
		subprotocols := c.Request.Header.Get("Sec-WebSocket-Protocol")
		tokens := strings.Split(subprotocols, ", ")
		if len(tokens) > 1 && tokens[0] == "Authorization" {
			token := tokens[1]
			_, err := cognitoAuth.ValidateToken(token)
			if err != nil {
				apiResponse.SendErrorResponse(c, http.StatusUnauthorized, "Invalid token")
				return
			}
		}
		c.Next()
	}
}

func CollaborationLimitMiddleware(concurrentLimit int) gin.HandlerFunc {
    return func(c *gin.Context) {
        // tier := c.MustGet("userTier").(UserTier)
        // limits := c.MustGet("tierLimits").(TierLimits)
        currentCollaborators := 0
        // Get current number of collaborators for this session
        sessionId := c.Param("sessionId")

        if clients, exists := wsProvider.Handler.Hub.Sessions[sessionId]; exists {
					currentCollaborators = len(clients) + 1
        }

        if currentCollaborators > concurrentLimit {
						c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden", "message": "Maximum collaborator limit reached for your tier"})
            return
        }

        c.Next()
    }
}

// func ProjectLimitMiddleware() gin.HandlerFunc {
//     return func(c *gin.Context) {
//         // tier := c.MustGet("userTier").(UserTier)
//         limits := c.MustGet("tierLimits").(TierLimits)

//         if limits.MaxProjects == 1 {
//             // For guest tier, check if they already have a project
//             if hasExistingProject(c) {
//                 c.JSON(http.StatusForbidden, gin.H{
//                     "error": "Maximum project limit reached for your tier",
//                 })
//                 c.Abort()
//                 return
//             }
//         }

//         c.Next()
//     }
// }
