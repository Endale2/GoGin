package controllers

import (
	"go-gin/config"
	"go-gin/websocket"
	"go.mongodb.org/mongo-driver/mongo"
)

// Shared variables across all controllers
var (
	userCollection    *mongo.Collection
	postCollection    *mongo.Collection
	commentCollection *mongo.Collection
	hub               *websocket.Hub
)

// InitCollections initializes all database collections
func InitCollections() {
	userCollection = config.DB.Collection("users")
	postCollection = config.DB.Collection("posts")
	commentCollection = config.DB.Collection("comments")
}

// SetHub sets the WebSocket hub for broadcasting
func SetHub(h *websocket.Hub) {
	hub = h
} 