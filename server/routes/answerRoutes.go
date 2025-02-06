package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func AnswerRoutes(r *gin.Engine) {
	answerRoutes := r.Group("/answers")
	answerRoutes.Use(middleware.AuthMiddleware())
	{
		answerRoutes.GET("/question/:question_id", controllers.GetAnswers) // Fetch all answers for a specific question
		answerRoutes.GET("/:id", controllers.GetAnswerByID)
		answerRoutes.POST("/", controllers.CreateAnswer)
		answerRoutes.PUT("/:id", controllers.UpdateAnswer)
		answerRoutes.DELETE("/:id", controllers.DeleteAnswer)
	}
}
