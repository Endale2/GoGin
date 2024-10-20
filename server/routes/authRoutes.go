package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	// Public routes
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	// Group for protected routes
	authorized := r.Group("/")
	authorized.Use(middleware.AuthMiddleware())
	{
		// Protected routes go here
		authorized.POST("/recipes", controllers.CreateRecipe) // Example protected route
		authorized.GET("/recipes", controllers.GetRecipes)    // Example protected route
	}
}
