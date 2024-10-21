package models

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)


type Question struct {
    ID        primitive.ObjectID  `bson:"_id,omitempty" json:"id,omitempty"`
    UserID    primitive.ObjectID  `bson:"user_id" json:"user_id" validate:"required"`  // Reference to User model
    CourseID  primitive.ObjectID  `bson:"course_id" json:"course_id" validate:"required"` // Reference to Course model
    Content   string              `bson:"content" json:"content" validate:"required"`   // Question content
    CreatedAt time.Time           `bson:"created_at" json:"created_at"`
}
