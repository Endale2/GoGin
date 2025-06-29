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

// GetReplies retrieves all replies for a specific answer, including user details
func GetReplies(c *gin.Context) {
	// Check if we're getting replies by answer ID from the answer route
	answerID := c.Param("id") // This will be the answer ID from /answers/:id/replies
	if answerID == "" {
		// Fallback to the old route parameter
		answerID = c.Param("answer_id")
	}
	
	objID, err := primitive.ObjectIDFromHex(answerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer ID"})
		return
	}

	collection := config.DB.Collection("replies")

	// Aggregation pipeline to join users collection
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"answer_id": objID}}},
		{
			{Key: "$lookup", Value: bson.M{
				"from":         "users",
				"localField":   "user_id",
				"foreignField": "_id",
				"as":           "user",
			}},
		},
		{
			{Key: "$unwind", Value: bson.M{"path": "$user", "preserveNullAndEmptyArrays": true}},
		},
		{
			{Key: "$project", Value: bson.M{
				"id":         "$_id",
				"answer_id":  1,
				"content":    1,
				"user_id":    1,
				"created_at": 1,
				"likes":      bson.M{"$size": bson.M{"$ifNull": []interface{}{"$likes", []interface{}{}}}},
				"dislikes":   bson.M{"$size": bson.M{"$ifNull": []interface{}{"$dislikes", []interface{}{}}}},
				"user": bson.M{
					"id":            "$user._id",
					"name":          "$user.name",
					"email":         "$user.email",
					"profile_image": "$user.profile_image",
				},
			}},
		},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch replies"})
		return
	}
	defer cursor.Close(context.Background())

	var replies []bson.M
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

	// Get answer ID from route parameter
	answerID := c.Param("id") // This will be the answer ID from /answers/:id/replies
	answerObjID, err := primitive.ObjectIDFromHex(answerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer ID"})
		return
	}

	if err := c.ShouldBindJSON(&reply); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	reply.UserID = objectID
	reply.AnswerID = answerObjID
	reply.CreatedAt = time.Now()

	collection := config.DB.Collection("replies")
	_, err = collection.InsertOne(context.Background(), reply)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create reply"})
		return
	}

	// Return the created reply with user information
	replyWithUser := bson.M{
		"id":         reply.ID,
		"answer_id":  reply.AnswerID,
		"content":    reply.Content,
		"created_at": reply.CreatedAt,
		"user": bson.M{
			"id":    reply.UserID,
			"name":  "", // Will be populated by the frontend or another query
			"email": "",
		},
	}

	c.JSON(http.StatusCreated, replyWithUser)
}

// GetReplyByID retrieves a reply by ID along with the user who created it
func GetReplyByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	collection := config.DB.Collection("replies")

	// Aggregation pipeline to fetch reply along with user details
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": objID}}},
		{
			{Key: "$lookup", Value: bson.M{
				"from":         "users",
				"localField":   "user_id",
				"foreignField": "_id",
				"as":           "user",
			}},
		},
		{{Key: "$unwind", Value: "$user"}}, // Ensure user data is returned as an object, not an array
		{
			{Key: "$project", Value: bson.M{
				"id":         "$_id",
				"answer_id":  1,
				"content":    1,
				"created_at": 1,
				"user": bson.M{
					"name":  "$user.name",
					"email": "$user.email",
				},
			}},
		},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching reply"})
		return
	}
	defer cursor.Close(context.Background())

	var results []bson.M
	if err = cursor.All(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing reply"})
		return
	}

	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reply not found"})
		return
	}

	// Return the first result (since we are searching by _id, there should only be one)
	c.JSON(http.StatusOK, results[0])
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
