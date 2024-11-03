package controllers

import (
	"context"
	"go-gin/config"
	"go-gin/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetCourses handles fetching all courses
func GetCourses(c *gin.Context) {
	collection := config.DB.Collection("courses")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch courses"})
		return
	}
	defer cursor.Close(context.Background())

	var courses []models.Course
	if err := cursor.All(context.Background(), &courses); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing courses"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

// GetCourseByID retrieves a course by ID
func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var course models.Course
	collection := config.DB.Collection("courses")
	err = collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&course)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	c.JSON(http.StatusOK, course)
}

// CreateCourse handles creating a new course
func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Set the creation time
	course.ID = primitive.NewObjectID()
	collection := config.DB.Collection("courses")
	_, err := collection.InsertOne(context.Background(), course)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create course"})
		return
	}

	c.JSON(http.StatusCreated, course)
}

// UpdateCourse updates a course by ID
func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateData models.Course
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	collection := config.DB.Collection("courses")
	filter := bson.M{"_id": objID}

	update := bson.M{
		"$set": bson.M{
			"title": updateData.Title,
		},
	}
	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course updated"})
}

// DeleteCourse deletes a course by ID
func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	collection := config.DB.Collection("courses")
	filter := bson.M{"_id": objID}

	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted"})
}
