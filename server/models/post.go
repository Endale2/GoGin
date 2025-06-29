package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title       string             `bson:"title" json:"title" validate:"required,min=1,max=300"`
	Content     string             `bson:"content" json:"content" validate:"required,min=1"`
	AuthorID    primitive.ObjectID `bson:"author_id" json:"author_id"`
	Author      User               `bson:"author" json:"author"`
	Tags        []string           `bson:"tags" json:"tags"`
	Upvotes     int                `bson:"upvotes" json:"upvotes"`
	Downvotes   int                `bson:"downvotes" json:"downvotes"`
	Score       int                `bson:"score" json:"score"`
	Comments    int                `bson:"comments" json:"comments"`
	IsDeleted   bool               `bson:"is_deleted" json:"is_deleted"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
} 