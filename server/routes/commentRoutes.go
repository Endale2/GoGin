package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func CommentRoutes(r *gin.Engine) {
	comments := r.Group("/comments")
	{
		comments.GET("/post/:postId", controllers.GetComments)
		comments.POST("/post/:postId", middleware.AuthMiddleware(), controllers.CreateComment)
		comments.PUT("/:commentId", middleware.AuthMiddleware(), controllers.UpdateComment)
		comments.DELETE("/:commentId", middleware.AuthMiddleware(), controllers.DeleteComment)
		comments.POST("/:commentId/:type", middleware.AuthMiddleware(), controllers.VoteComment) // upvote or downvote
	}
} 