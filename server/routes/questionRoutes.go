package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func QuestionRoutes(r *gin.Engine) {
	questionRoutes := r.Group("/questions")
	questionRoutes.Use(middleware.AuthMiddleware())
	{
		questionRoutes.GET("/", controllers.GetQuestions)
		questionRoutes.GET("/:id", controllers.GetQuestionByID)
		questionRoutes.POST("/", controllers.CreateQuestion)
		questionRoutes.PUT("/:id", controllers.UpdateQuestion)
		questionRoutes.DELETE("/:id", controllers.DeleteQuestion)
	}
}
