package routes

import (
	"go-gin/controllers"
	"go-gin/middleware"

	"github.com/gin-gonic/gin"
)

func RecipeRoutes(r *gin.Engine) {
	recipeRoutes := r.Group("/recipes")

	{
		recipeRoutes.POST("/", controllers.CreateRecipe)
		recipeRoutes.GET("/", middleware.AuthMiddleware(), controllers.GetRecipes)
		recipeRoutes.PUT("/:id", controllers.UpdateRecipe)
		recipeRoutes.DELETE("/:id", controllers.DeleteRecipe)
	}
}
