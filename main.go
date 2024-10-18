package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	app := gin.Default()

	// MongoDB connection
	config.ConnectDB()

	// Setup routes
	routes.UserRoutes(app)

	// Start server
	app.Run(":8080")
}
