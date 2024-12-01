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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// excluding sensitive fields
type SafeUser struct {
	ID       primitive.ObjectID `json:"id"`
	Name     string             `json:"name"`
	Email    string             `json:"email"`
	JoinedAt time.Time          `json:"joined_at"`
}

type QuestionWithUser struct {
	models.Question
	User SafeUser `json:"user"`
}

func GetQuestions(c *gin.Context) {
	questionCollection := config.DB.Collection("questions")
	userCollection := config.DB.Collection("users")

	// Add sort option to order by `created_at` in descending order
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := questionCollection.Find(context.Background(), bson.M{}, findOptions)
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

	var questionsWithUserData []QuestionWithUser
	for _, question := range questions {
		var user models.User
		err := userCollection.FindOne(context.Background(), bson.M{"_id": question.UserID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user information"})
			return
		}

		// Embed only the safe user data
		questionsWithUserData = append(questionsWithUserData, QuestionWithUser{
			Question: question,
			User: SafeUser{
				ID:       user.ID,
				Name:     user.Name,
				Email:    user.Email,
				JoinedAt: user.JoinedAt,
			},
		})
	}

	c.JSON(http.StatusOK, questionsWithUserData)
}

func GetQuestionByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var question models.Question
	questionCollection := config.DB.Collection("questions")
	err = questionCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&question)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	var user models.User
	userCollection := config.DB.Collection("users")
	err = userCollection.FindOne(context.Background(), bson.M{"_id": question.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user information"})
		return
	}

	questionWithUserData := QuestionWithUser{
		Question: question,
		User: SafeUser{
			ID:       user.ID,
			Name:     user.Name,
			Email:    user.Email,
			JoinedAt: user.JoinedAt,
		},
	}

	c.JSON(http.StatusOK, questionWithUserData)
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
