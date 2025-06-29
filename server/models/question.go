package models

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)


type Question struct {
    ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    UserID       primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`  // Reference to User model
    CourseID     primitive.ObjectID `bson:"course_id" json:"course_id" validate:"required"` // Reference to Course model
    UniversityID *primitive.ObjectID `bson:"university_id,omitempty" json:"university_id,omitempty"` // Optional reference to University
    DepartmentID *primitive.ObjectID `bson:"department_id,omitempty" json:"department_id,omitempty"` // Optional reference to Department
    Title        string             `bson:"title,omitempty" json:"title,omitempty"` // Optional title for the question
    Content      string             `bson:"content" json:"content" validate:"required"`   // Question content
    Type         string             `bson:"type" json:"type"` // "question" or "vent"
    CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt    *time.Time         `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
    Likes        []primitive.ObjectID `bson:"likes,omitempty" json:"likes,omitempty"` // Array of user IDs who liked
    Dislikes     []primitive.ObjectID `bson:"dislikes,omitempty" json:"dislikes,omitempty"` // Array of user IDs who disliked
    SavedBy      []primitive.ObjectID `bson:"saved_by,omitempty" json:"saved_by,omitempty"` // Array of user IDs who saved
}
