package main

import (
	"log"
	"os"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/controllers"
	authControllers "ventapp/server/ventapp/controllers"
	"ventapp/server/ventapp/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// load config
	cfg := config.DefaultConfig()
	if port := os.Getenv("PORT"); port != "" {
		cfg.Port = port
	}

	// connect DB
	if err := config.Connect(cfg.MongoURI, cfg.DBName); err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}
	defer config.Disconnect()

	r := gin.Default()


	// attach JWT middleware globally (it will be permissive: allows anonymous)
	r.Use(middleware.JWTAuth())

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authControllers.Register)
		auth.POST("/login", authControllers.Login)
	}

	// Posts (vents) routes
	posts := r.Group("/posts")
	{
		posts.POST("/", controllers.CreateVent)
		posts.GET("/", controllers.GetVents)
	}

	addr := ":" + cfg.Port
	log.Printf("starting server on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
