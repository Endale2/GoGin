package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func PostRoutes(router *gin.Engine) {
	posts := router.Group("/posts")
	{
		// LIST & FILTER: matches GET /posts and GET /posts?sort=new
		posts.GET("/", controllers.GetPosts)

		// DETAIL
		posts.GET("/:id", controllers.GetPost)

		// CREATE
		posts.POST("/", middleware.AuthMiddleware(), controllers.CreatePost)

		// UPDATE & DELETE
		posts.PUT("/:id", middleware.AuthMiddleware(), controllers.UpdatePost)
		posts.DELETE("/:id", middleware.AuthMiddleware(), controllers.DeletePost)

		// VOTE (up/down) and SAVE/UNSAVE
		posts.POST("/:id/:type", middleware.AuthMiddleware(), controllers.VotePost)
		posts.POST("/:id/save", middleware.AuthMiddleware(), controllers.SavePost)
		posts.DELETE("/:id/save", middleware.AuthMiddleware(), controllers.UnsavePost)

		// FILTER
		posts.POST("/filter", controllers.FilterPosts)
	}
}
