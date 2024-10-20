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

// CreateRecipe handles creating a new recipe
func CreateRecipe(c *gin.Context) {
	var recipe models.Recipe
	if err := c.ShouldBindJSON(&recipe); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe data"})
		return
	}

	// Extract the user ID from the context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Convert userID to primitive.ObjectID
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	userIDObj, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Set the user ID in the recipe model
	recipe.UserID = userIDObj

	collection := config.DB.Collection("recipes")
	_, err = collection.InsertOne(context.Background(), recipe)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create recipe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe created successfully!"})
}

// GetRecipes handles fetching all recipes
func GetRecipes(c *gin.Context) {
	collection := config.DB.Collection("recipes")

	// Fetch all recipes
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch recipes"})
		return
	}
	defer cursor.Close(context.Background())

	var recipes []models.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing recipes"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

// UpdateRecipe handles updating a recipe by ID
func UpdateRecipe(c *gin.Context) {
	id := c.Param("id")

	// Parse the ID into a MongoDB ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	var recipe models.Recipe
	if err := c.ShouldBindJSON(&recipe); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe data"})
		return
	}

	collection := config.DB.Collection("recipes")

	// Update the recipe by ID
	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID},
		bson.M{"$set": recipe},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update recipe"})
		return
	}

	if result.ModifiedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe updated successfully!"})
}

// DeleteRecipe handles deleting a recipe by ID
func DeleteRecipe(c *gin.Context) {
	id := c.Param("id")

	// Parse the ID into a MongoDB ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	collection := config.DB.Collection("recipes")

	// Delete the recipe by ID
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete recipe"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe deleted successfully!"})
}
