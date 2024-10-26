package routes

import (
	"go-gin/controllers"

	"github.com/gin-gonic/gin"
)

func QuestionRoutes(r *gin.Engine) {
	questionRoutes := r.Group("/questions")
	{
		questionRoutes.GET("/", controllers.GetQuestions)
		questionRoutes.GET("/:id", controllers.GetQuestionByID)
		questionRoutes.POST("/", controllers.CreateQuestion)
		questionRoutes.PUT("/:id", controllers.UpdateQuestion)
		questionRoutes.DELETE("/:id", controllers.DeleteQuestion)
	}
}
