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
		questionRoutes.GET("/:id/answers", controllers.GetAnswers)
		questionRoutes.POST("/", controllers.CreateQuestion)
		questionRoutes.PUT("/:id", controllers.UpdateQuestion)
		questionRoutes.DELETE("/:id", controllers.DeleteQuestion)
		questionRoutes.POST("/:id/like", controllers.LikeQuestion)
		questionRoutes.POST("/:id/dislike", controllers.DislikeQuestion)
		questionRoutes.POST("/:id/save", controllers.SaveQuestion)
		questionRoutes.DELETE("/:id/save", controllers.UnsaveQuestion)
	}
}
