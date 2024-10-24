package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	app := gin.Default()

	// CORS configuration,,, we can also write cors conf in separate file
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}

	// Apply the CORS middleware
	app.Use(cors.New(corsConfig))

	// Database connection
	config.ConnectDB()

	// Routes
	routes.AuthRoutes(app)
	routes.RecipeRoutes(app)
	routes.QuestionRoutes(app)

	app.Run(":8080")
}
