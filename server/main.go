package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Set trusted proxies if you're behind a proxy
	r.SetTrustedProxies([]string{"127.0.0.1"}) // Optional if behind a proxy

	// CORS configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Important for sending cookies
	}

	// Apply the CORS middleware
	r.Use(cors.New(corsConfig))

	// Database connection
	config.ConnectDB()

	// Routes
	routes.AuthRoutes(r)
	routes.RecipeRoutes(r)
	routes.QuestionRoutes(r)

	r.Run(":8080")
}
