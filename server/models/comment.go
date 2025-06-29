package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Content   string             `bson:"content" json:"content" validate:"required,min=1"`
	PostID    primitive.ObjectID `bson:"post_id" json:"post_id"`
	AuthorID  primitive.ObjectID `bson:"author_id" json:"author_id"`
	Author    User               `bson:"author" json:"author"`
	ParentID  *primitive.ObjectID `bson:"parent_id,omitempty" json:"parent_id,omitempty"`
	Replies   []Comment          `bson:"replies,omitempty" json:"replies,omitempty"`
	Upvotes   int                `bson:"upvotes" json:"upvotes"`
	Downvotes int                `bson:"downvotes" json:"downvotes"`
	Score     int                `bson:"score" json:"score"`
	IsDeleted bool               `bson:"is_deleted" json:"is_deleted"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
} 