package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Friend represents a friendship between two users
type Friend struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID1   primitive.ObjectID `bson:"user_id_1" json:"user_id_1" validate:"required"`                          // Reference to one User model
	UserID2   primitive.ObjectID `bson:"user_id_2" json:"user_id_2" validate:"required"`                          // Reference to the other User model
	Status    string             `bson:"status" json:"status" validate:"required,oneof=pending accepted blocked"` // Friendship status
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`                                            // Timestamp for when the friendship was initiated
}
