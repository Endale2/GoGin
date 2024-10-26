package controllers

import (
	"context"
	"go-gin/config"
	"go-gin/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetQuestions handles fetching all questions
func GetQuestions(c *gin.Context) {
	collection := config.DB.Collection("questions")

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch questions"})
		return
	}
	defer cursor.Close(context.Background())

	var questions []models.Question
	if err := cursor.All(context.Background(), &questions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing questions"})
		return
	}

	c.JSON(http.StatusOK, questions)
}

// CreateQuestion handles creating a new question
func CreateQuestion(c *gin.Context) {
	var question models.Question

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := c.ShouldBindJSON(&question); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	question.UserID = objectID
	question.CreatedAt = time.Now()

	collection := config.DB.Collection("questions")
	_, err = collection.InsertOne(context.Background(), question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create question"})
		return
	}

	c.JSON(http.StatusCreated, question)
}

// GetQuestionByID retrieves a question by ID
func GetQuestionByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var question models.Question
	collection := config.DB.Collection("questions")
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&question)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, question)
}

// UpdateQuestion updates a question by ID
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateData models.Question
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.DB.Collection("questions")
	filter := bson.M{"_id": objID, "user_id": objectID}

	update := bson.M{
		"$set": bson.M{
			"content":    updateData.Content,
			"updated_at": time.Now(),
		},
	}
	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No permission or question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question updated"})
}

// DeleteQuestion deletes a question by ID
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.DB.Collection("questions")
	filter := bson.M{"_id": objID, "user_id": objectID}

	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No permission or question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question deleted"})
}
