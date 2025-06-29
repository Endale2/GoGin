package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email      string             `bson:"email" json:"email"`
	Password   string             `bson:"password" json:"password,omitempty"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	LastActive time.Time          `bson:"last_active" json:"last_active"`
	Karma      int                `bson:"karma" json:"karma"`
}
