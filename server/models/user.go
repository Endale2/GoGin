package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string               `bson:"name" json:"name" validate:"required"`
	Email        string               `bson:"email" json:"email" validate:"required,email"`
	Password     string               `bson:"password" json:"password" validate:"required"`
	PhoneNumber  *string              `bson:"phone_number,omitempty" json:"phone_number,omitempty"`   // optional
	DepartmentID *primitive.ObjectID  `bson:"department_id,omitempty" json:"department_id,omitempty"` // optional foreign key to department
	AddedCourses []primitive.ObjectID `bson:"added_courses" json:"added_courses"`                     // references to courses
	JoinedAt     time.Time            `bson:"joined_at" json:"joined_at"`
}
