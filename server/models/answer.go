package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Answer represents an answer to a question
type Answer struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	QuestionID primitive.ObjectID `bson:"question_id" json:"question_id" validate:"required"` // Reference to Question model
	Content    string             `bson:"content" json:"content" validate:"required"`         // Answer content
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`         // Reference to User model (creator)
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	Likes      []primitive.ObjectID `bson:"likes,omitempty" json:"likes,omitempty"`             // Array of user IDs who liked this answer
	Dislikes   []primitive.ObjectID `bson:"dislikes,omitempty" json:"dislikes,omitempty"`       // Array of user IDs who disliked this answer
}
