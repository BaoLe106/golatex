package apiResponse

import "github.com/gin-gonic/gin"


func SendErrorResponse(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{"error": message})
	c.Abort() // Stops further processing (like `return`)
}

func SendGetRequestResponse(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}
func SendPostRequestResponse(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}

func SendDeleteRequestResponse(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"message":    message,
	})
}