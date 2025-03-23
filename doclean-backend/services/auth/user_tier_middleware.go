package auth

import (
	"net/http"
	"strings"

	"github.com/BaoLe106/doclean/doclean-backend/utils/apiResponse"

	// "github.com/BaoLe106/doclean/doclean-backend/services/latex"
	"github.com/gin-gonic/gin"
)

func TierMiddleware(tier UserTier, cognitoAuth *CognitoAuth) gin.HandlerFunc {
    return func(c *gin.Context) {
        limits := TierConfigs[tier]
        
        // Store tier information in context
        c.Set("userTier", tier)
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

// func CollaborationLimitMiddleware(handler *latex.Handler) gin.HandlerFunc {
//     return func(c *gin.Context) {
//         // tier := c.MustGet("userTier").(UserTier)
//         limits := c.MustGet("tierLimits").(TierLimits)
//         currentCollaborators := 0
//         // Get current number of collaborators for this session
//         sessionID := c.Param("sessionId")

//         if clients, exists := handler.Hub.Sessions[sessionID]; exists {
// 					currentCollaborators = len(clients) + 1
//         }
//         fmt.Println("#DEBUG::collab num", currentCollaborators)

//         if currentCollaborators > limits.MaxCollaborators {
//             apiResponse.SendErrorResponse(c, http.StatusForbidden, "Maximum collaborator limit reached for your tier")
//             return
//         }

//         c.Next()
//     }
// }

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