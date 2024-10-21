package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reply struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	AnswerID  primitive.ObjectID `bson:"answer_id" json:"answer_id" validate:"required"`     // Reference to Answer model
	Content   string             `bson:"content" json:"content" validate:"required,max=100"` // Reply content, limited to 100 characters
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`         // Reference to User model (creator of reply)
	ReplyToID primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`         // Reference to another User (optional, the user being replied to)
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
