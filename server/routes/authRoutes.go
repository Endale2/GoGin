package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/logout", middleware.AuthMiddleware(), controllers.Logout)
		auth.GET("/me", middleware.AuthMiddleware(), controllers.GetCurrentUser)
		auth.POST("/refresh-token", controllers.RefreshToken)
	}
}
