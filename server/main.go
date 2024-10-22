package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Updated CORS configuration to allow only the frontend origin
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Explicitly allow only your frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Enable credentials (cookies, etc.)
	}

	r.Use(cors.New(corsConfig))

	// Database connection
	config.ConnectDB()

	// Routes
	routes.AuthRoutes(r)
	routes.RecipeRoutes(r)

	// Start the server on port 8080
	r.Run(":8080")
}
