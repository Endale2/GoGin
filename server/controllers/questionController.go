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
	ProfileImage string         `json:"profile_image"`
}

type QuestionWithUser struct {
	models.Question
	User SafeUser `json:"user"`
}

func GetQuestions(c *gin.Context) {
	questionCollection := config.DB.Collection("questions")
	userCollection := config.DB.Collection("users")

	// Get search parameters
	searchQuery := c.Query("search")
	courseFilter := c.Query("course")
	universityFilter := c.Query("university")
	departmentFilter := c.Query("department")
	questionType := c.Query("type") // "question" or "vent"

	// Build filter
	filter := bson.M{}
	
	// Add type filter (question or vent)
	if questionType != "" {
		filter["type"] = questionType
	} else {
		filter["type"] = "question" // Default to questions
	}

	// Add search filter
	if searchQuery != "" {
		filter["$or"] = []bson.M{
			{"content": bson.M{"$regex": searchQuery, "$options": "i"}},
			{"title": bson.M{"$regex": searchQuery, "$options": "i"}},
		}
	}

	// Add course filter
	if courseFilter != "" {
		filter["course_id"] = courseFilter
	}

	// Add university filter
	if universityFilter != "" {
		filter["university_id"] = universityFilter
	}

	// Add department filter
	if departmentFilter != "" {
		filter["department_id"] = departmentFilter
	}

	// Add sort option to order by `created_at` in descending order
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := questionCollection.Find(context.Background(), filter, findOptions)
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
				ID:           user.ID,
				Name:         user.Name,
				Email:        user.Email,
				JoinedAt:     user.JoinedAt,
				ProfileImage: user.ProfileImage,
			},
		})
	}

	c.JSON(http.StatusOK, questionsWithUserData)
}

// GetQuestionByID retrieves a question by ID with user and course information
func GetQuestionByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	questionCollection := config.DB.Collection("questions")
	userCollection := config.DB.Collection("users")
	courseCollection := config.DB.Collection("courses")
	universityCollection := config.DB.Collection("universities")
	departmentCollection := config.DB.Collection("departments")

	// Find the question
	var question models.Question
	err = questionCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&question)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	// Get user information
	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"_id": question.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user information"})
		return
	}

	// Get course information
	var course models.Course
	err = courseCollection.FindOne(context.Background(), bson.M{"_id": question.CourseID}).Decode(&course)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching course information"})
		return
	}

	// Prepare response
	response := gin.H{
		"id":           question.ID,
		"user_id":      question.UserID,
		"course_id":    question.CourseID,
		"title":        question.Title,
		"content":      question.Content,
		"type":         question.Type,
		"created_at":   question.CreatedAt,
		"updated_at":   question.UpdatedAt,
		"likes":        len(question.Likes),
		"dislikes":     len(question.Dislikes),
		"saved_by":     len(question.SavedBy),
		"user": gin.H{
			"id":           user.ID,
			"name":         user.Name,
			"email":        user.Email,
			"profile_image": user.ProfileImage,
		},
		"course": gin.H{
			"id":    course.ID,
			"title": course.Title,
		},
	}

	// Add university information if available
	if question.UniversityID != nil {
		var university models.University
		err = universityCollection.FindOne(context.Background(), bson.M{"_id": *question.UniversityID}).Decode(&university)
		if err == nil {
			response["university"] = gin.H{
				"id":   university.ID,
				"name": university.Name,
			}
		}
	}

	// Add department information if available
	if question.DepartmentID != nil {
		var department models.Department
		err = departmentCollection.FindOne(context.Background(), bson.M{"_id": *question.DepartmentID}).Decode(&department)
		if err == nil {
			response["department"] = gin.H{
				"id":   department.ID,
				"name": department.Name,
			}
		}
	}

	c.JSON(http.StatusOK, response)
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
	
	// Set default type if not provided
	if question.Type == "" {
		question.Type = "question"
	}

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

// LikeQuestion handles liking a question
func LikeQuestion(c *gin.Context) {
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
	
	// Add user to likes array if not already present
	update := bson.M{
		"$addToSet": bson.M{"likes": objectID},
		"$pull":     bson.M{"dislikes": objectID}, // Remove from dislikes if present
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like question"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question liked successfully"})
}

// DislikeQuestion handles disliking a question
func DislikeQuestion(c *gin.Context) {
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
	
	// Add user to dislikes array if not already present
	update := bson.M{
		"$addToSet": bson.M{"dislikes": objectID},
		"$pull":     bson.M{"likes": objectID}, // Remove from likes if present
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to dislike question"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question disliked successfully"})
}

// SaveQuestion handles saving a question
func SaveQuestion(c *gin.Context) {
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
	
	// Add user to saved_by array if not already present
	update := bson.M{
		"$addToSet": bson.M{"saved_by": objectID},
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save question"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question saved successfully"})
}

// UnsaveQuestion handles unsaving a question
func UnsaveQuestion(c *gin.Context) {
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
	
	// Remove user from saved_by array
	update := bson.M{
		"$pull": bson.M{"saved_by": objectID},
	}
	
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsave question"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Question unsaved successfully"})
}
