package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Course struct {
	ID    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title string             `bson:"title" json:"title" validate:"required"`
}
