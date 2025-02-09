package latex

import "github.com/gin-gonic/gin"


func AddLatexRoutes(rg *gin.RouterGroup) {
	latexRoute := rg.Group("/latex")
	latexHandler := NewHandler()

	latexRoute.GET("/:sessionId", latexHandler.HandleConnection)
	latexRoute.POST("/tex/:sessionId", CreateTexFile)
}

