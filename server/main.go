package main

import (
	"go-gin/config"
	"go-gin/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	config.ConnectDB()

	routes.AuthRoutes(r)
	routes.RecipeRoutes(r)

	r.Run(":8080")
}
