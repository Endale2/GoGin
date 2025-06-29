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
	"go.mongodb.org/mongo-driver/mongo"
)

// GetAnswers retrieves all answers for a specific question
func GetAnswers(c *gin.Context) {
	// Check if we're getting answers by question ID from the question route
	questionID := c.Param("id") // This will be the question ID from /questions/:id/answers
	if questionID == "" {
		// Fallback to the old route parameter
		questionID = c.Param("question_id")
	}
	
	objID, err := primitive.ObjectIDFromHex(questionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question ID"})
		return
	}

	collection := config.DB.Collection("answers")

	// MongoDB aggregation pipeline
	pipeline := mongo.Pipeline{
		{
			{"$match", bson.D{{"question_id", objID}}},
		},
		{
			{"$lookup", bson.D{
				{"from", "users"},
				{"localField", "user_id"},
				{"foreignField", "_id"},
				{"as", "user"},
			}},
		},
		{
			{"$unwind", bson.D{
				{"path", "$user"},
				{"preserveNullAndEmptyArrays", true}, // In case user data is missing
			}},
		},
		{
			{"$lookup", bson.D{
				{"from", "replies"},
				{"localField", "_id"},
				{"foreignField", "answer_id"},
				{"as", "replies"},
			}},
		},
		{
			{"$project", bson.D{
				{"id", "$_id"},
				{"question_id", 1},
				{"content", 1},
				{"created_at", 1},
				{"likes", bson.D{{"$size", bson.D{{"$ifNull", []interface{}{"$likes", []interface{}{}}}}}}},
				{"dislikes", bson.D{{"$size", bson.D{{"$ifNull", []interface{}{"$dislikes", []interface{}{}}}}}}},
				{"user", bson.D{
					{"id", "$user._id"},
					{"name", "$user.name"},
					{"email", "$user.email"},
					{"profile_image", "$user.profile_image"},
				}},
				{"replies", bson.D{
					{"$map", bson.D{
						{"input", "$replies"},
						{"as", "reply"},
						{"in", bson.D{
							{"id", "$$reply._id"},
							{"content", "$$reply.content"},
							{"created_at", "$$reply.created_at"},
							{"user", bson.D{
								{"id", "$$reply.user_id"},
								{"name", "$$reply.user_name"},
								{"email", "$$reply.user_email"},
							}},
						}},
					}},
				}},
			}},
		},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch answers"})
		return
	}
	defer cursor.Close(context.Background())

	answers := make([]bson.M, 0) // Use bson.M for flexible JSON response
	if err := cursor.All(context.Background(), &answers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing answers"})
		return
	}

	c.JSON(http.StatusOK, answers)
}

// CreateAnswer handles creating a new answer for a question
func CreateAnswer(c *gin.Context) {
	var answer models.Answer

	// Retrieve current user ID (assumed available in context after authentication)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Convert userID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse and validate request body
	if err := c.ShouldBindJSON(&answer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Set UserID and timestamp
	answer.UserID = objectID
	answer.CreatedAt = time.Now()

	// Insert the answer into MongoDB
	collection := config.DB.Collection("answers")
	_, err = collection.InsertOne(context.Background(), answer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create answer"})
		return
	}

	c.JSON(http.StatusCreated, answer)
}

// GetAnswerByID retrieves an answer by ID
func GetAnswerByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Find answer by ID
	var answer models.Answer
	collection := config.DB.Collection("answers")
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&answer)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Answer not found"})
		return
	}

	c.JSON(http.StatusOK, answer)
}

// UpdateAnswer updates an answer by ID
func UpdateAnswer(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateData models.Answer
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Ensure the answer belongs to the user
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

	collection := config.DB.Collection("answers")
	filter := bson.M{"_id": objID, "user_id": objectID}

	// Perform the update
	update := bson.M{
		"$set": bson.M{
			"content":    updateData.Content,
			"updated_at": time.Now(),
		},
	}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update answer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer updated"})
}

// DeleteAnswer deletes an answer by ID
func DeleteAnswer(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Ensure the answer belongs to the user
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

	collection := config.DB.Collection("answers")
	filter := bson.M{"_id": objID, "user_id": objectID}

	// Delete the answer
	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete answer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer deleted"})
}

// LikeAnswer handles liking an answer
func LikeAnswer(c *gin.Context) {
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

	collection := config.DB.Collection("answers")
	
	// Add user to likes array if not already present
	update := bson.M{
		"$addToSet": bson.M{"likes": objectID},
		"$pull":     bson.M{"dislikes": objectID}, // Remove from dislikes if present
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like answer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer liked successfully"})
}

// DislikeAnswer handles disliking an answer
func DislikeAnswer(c *gin.Context) {
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

	collection := config.DB.Collection("answers")
	
	// Add user to dislikes array if not already present
	update := bson.M{
		"$addToSet": bson.M{"dislikes": objectID},
		"$pull":     bson.M{"likes": objectID}, // Remove from likes if present
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to dislike answer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer disliked successfully"})
}
