package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func ReplyRoutes(r *gin.Engine) {
	replyRoutes := r.Group("/replies")
	replyRoutes.Use(middleware.AuthMiddleware())
	{
		replyRoutes.GET("/answer/:answer_id", controllers.GetReplies) // Fetch all answers for a specific question
		replyRoutes.GET("/:id", controllers.GetReplyByID)
		replyRoutes.POST("/", controllers.CreateReply)
		replyRoutes.PUT("/:id", controllers.UpdateReply)
		replyRoutes.DELETE("/:id", controllers.DeleteReply)
	}
}
