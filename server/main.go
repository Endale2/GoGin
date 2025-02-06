package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	app := gin.Default()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Database connection
	config.ConnectDB()

	// Routes
	routes.AuthRoutes(app)
	routes.CourseRoutes(app)
	routes.RecipeRoutes(app)
	routes.QuestionRoutes(app)
	routes.AnswerRoutes(app)

	app.Run(":8080")
}
