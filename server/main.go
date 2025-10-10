package main

import (
	"log"
	"os"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/controllers"

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
