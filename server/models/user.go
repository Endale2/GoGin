package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string               `bson:"name" json:"name" validate:"required,min=2,max=100"`
	Email        string               `bson:"email" json:"email" validate:"required,email"`
	Password     string               `bson:"password" json:"password" validate:"required,min=8"`
	PhoneNumber  *string              `bson:"phone_number,omitempty" json:"phone_number,omitempty"`   // optional
	DepartmentID *primitive.ObjectID  `bson:"department_id,omitempty" json:"department_id,omitempty"` // optional foreign key to department
	UniversityID *primitive.ObjectID  `bson:"university_id,omitempty" json:"university_id,omitempty"` // optional foreign key to university
	StudentID    *string              `bson:"student_id,omitempty" json:"student_id,omitempty"`       // optional student ID
	YearOfStudy  *int                 `bson:"year_of_study,omitempty" json:"year_of_study,omitempty"` // optional year of study (1-6)
	AddedCourses []primitive.ObjectID `bson:"added_courses" json:"added_courses"`                     // references to courses
	JoinedAt     time.Time            `bson:"joined_at" json:"joined_at"`
	ProfileImage string               `bson:"profile_image,omitempty" json:"profile_image,omitempty"`
	IsVerified   bool                 `bson:"is_verified" json:"is_verified"`                         // email verification status
	LastActive   time.Time            `bson:"last_active" json:"last_active"`                         // last activity timestamp
}
