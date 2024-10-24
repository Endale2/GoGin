package routes

import (
	"go-gin/controllers"

	"github.com/gin-gonic/gin"
)

func QuestionRoutes(r *gin.Engine) {
	questionRoutes := r.Group("/questions")
	{
		questionRoutes.GET("/", controllers.Getquestions)
	}
}
