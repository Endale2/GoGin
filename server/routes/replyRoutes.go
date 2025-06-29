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
		replyRoutes.GET("/", controllers.GetReplies)
		replyRoutes.GET("/:id", controllers.GetReplyByID)
		replyRoutes.POST("/", controllers.CreateReply)
		replyRoutes.PUT("/:id", controllers.UpdateReply)
		replyRoutes.DELETE("/:id", controllers.DeleteReply)
		replyRoutes.POST("/:id/like", controllers.LikeReply)
		replyRoutes.POST("/:id/dislike", controllers.DislikeReply)
	}
}
