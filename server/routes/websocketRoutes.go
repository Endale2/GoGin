package routes

import (
	"go-gin/websocket"

	"github.com/gin-gonic/gin"
)

func WebSocketRoutes(router *gin.Engine, hub *websocket.Hub) {
	router.GET("/ws", websocket.HandleWebSocket(hub))
} 