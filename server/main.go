// main.go
package main

import (
	"os"
	"time"

	"go-gin/config"
	"go-gin/controllers"
	"go-gin/routes"
	"go-gin/websocket"

	"github.com/gin-gonic/gin"
)

// Custom CORS middleware
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Debug logging
		println("CORS middleware called for:", c.Request.Method, c.Request.URL.Path)

		// Set CORS headers for all requests
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers",
			"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Header("Access-Control-Expose-Headers", "Content-Length")
		c.Header("Access-Control-Max-Age", time.Duration(12*time.Hour).String())

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			println("Handling OPTIONS preflight request")
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// Disable automatic trailing‑slash redirects (optional)
	gin.DisableConsoleColor()
	app := gin.Default()
	app.RedirectTrailingSlash = false

	// 1) Apply CORS globally
	app.Use(CORSMiddleware())

	// 2) Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// 3) Initialize database & controllers
	config.ConnectDB()
	controllers.InitCollections()

	// 4) Set WebSocket hub for controllers
	controllers.SetHub(hub)

	// 5) Static file serving
	app.Static("/uploads", "./uploads")

	// 6) All routes
	routes.AuthRoutes(app)
	routes.PostRoutes(app)
	routes.CommentRoutes(app)
	routes.WebSocketRoutes(app, hub)

	// 7) Start server
	// Allow override with PORT environment variable for local testing
	port := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		port = ":" + p
	}
	app.Run(port)
}
