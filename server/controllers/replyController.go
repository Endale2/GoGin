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

// GetReplies retrieves all replies for a specific answer
func GetReplies(c *gin.Context) {
	answerID := c.Param("answer_id")
	objID, err := primitive.ObjectIDFromHex(answerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer ID"})
		return
	}

	collection := config.DB.Collection("replies")
	cursor, err := collection.Find(context.Background(), bson.M{"answer_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch replies"})
		return
	}
	defer cursor.Close(context.Background())

	var replies []models.Reply
	if err := cursor.All(context.Background(), &replies); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing replies"})
		return
	}

	c.JSON(http.StatusOK, replies)
}

// CreateReply handles creating a new reply for an answer
func CreateReply(c *gin.Context) {
	var reply models.Reply

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

	if err := c.ShouldBindJSON(&reply); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	reply.UserID = objectID
	reply.CreatedAt = time.Now()

	collection := config.DB.Collection("replies")
	_, err = collection.InsertOne(context.Background(), reply)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create reply"})
		return
	}

	c.JSON(http.StatusCreated, reply)
}

// GetReplyByID retrieves a reply by ID
func GetReplyByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var reply models.Reply
	collection := config.DB.Collection("replies")
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&reply)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reply not found"})
		return
	}

	c.JSON(http.StatusOK, reply)
}

// UpdateReply updates a reply by ID
func UpdateReply(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateData models.Reply
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

	collection := config.DB.Collection("replies")
	filter := bson.M{"_id": objID, "user_id": objectID}

	update := bson.M{
		"$set": bson.M{
			"content":    updateData.Content,
			"updated_at": time.Now(),
		},
	}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reply"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reply updated"})
}

// DeleteReply deletes a reply by ID
func DeleteReply(c *gin.Context) {
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

	collection := config.DB.Collection("replies")
	filter := bson.M{"_id": objID, "user_id": objectID}

	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete reply"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reply deleted"})
}
