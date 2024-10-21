package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LikedAnswer represents an answer liked by a user
type LikedAnswer struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID   primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`     // Reference to User model (who liked the answer)
	AnswerID primitive.ObjectID `bson:"answer_id" json:"answer_id" validate:"required"` // Reference to Answer model (the liked answer)
	LikedAt  time.Time          `bson:"liked_at" json:"liked_at"`                       // Timestamp for when the answer was liked
}
