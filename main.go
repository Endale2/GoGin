package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// MongoDB connection
	config.ConnectDB()

	// Setup routes
	routes.UserRoutes(router)

	// Start server
	router.Run(":8080")
}
