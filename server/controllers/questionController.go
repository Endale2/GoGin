package controllers

import (
	"context"
	"go-gin/config"
	"go-gin/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	//"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetRecipes handles fetching all recipes
func Getquestions(c *gin.Context) {
	collection := config.DB.Collection("questions")

	// Fetch all recipes
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch questions"})
		return
	}
	defer cursor.Close(context.Background())

	var questions []models.Question
	if err := cursor.All(context.Background(), &questions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing recipes"})
		return
	}

	c.JSON(http.StatusOK, questions)
}
