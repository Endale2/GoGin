package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Recipe represents a recipe document in MongoDB
type Recipe struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	Title        string             `bson:"title"`
	Ingredients  []string           `bson:"ingredients"`  // List of ingredients
	Instructions []string           `bson:"instructions"` // List of step-by-step instructions
	UserID       primitive.ObjectID `bson:"userId"`       // ID of the user who created the recipe
	Favorite     bool               `bson:"favorite"`     // Whether the recipe is marked as a favorite
	Category     string             `bson:"category"`     // Category of the recipe (e.g., Dinner, Breakfast)
	PrepTime     int                `bson:"prep_time"`    // Preparation time in minutes
	CookTime     int                `bson:"cook_time"`    // Cooking time in minutes
	CreatedAt    primitive.DateTime `bson:"created_at"`   // Creation timestamp
	UpdatedAt    primitive.DateTime `bson:"updated_at"`   // Last updated timestamp
}
