package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// SavedQuestion represents a question saved by a user
type SavedQuestion struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`         // Reference to User model (who saved the question)
	QuestionID primitive.ObjectID `bson:"question_id" json:"question_id" validate:"required"` // Reference to Question model
	SavedAt    time.Time          `bson:"saved_at" json:"saved_at"`                           // Timestamp for when the question was saved
}
