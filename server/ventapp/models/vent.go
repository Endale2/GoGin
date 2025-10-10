package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Vent struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	AuthorID  primitive.ObjectID   `bson:"author_id" json:"author_id"`
	Content   string               `bson:"content" json:"content"`
	Tags      []string             `bson:"tags" json:"tags"`
	Upvotes   int                  `bson:"upvotes" json:"upvotes"`
	Downvotes int                  `bson:"downvotes" json:"downvotes"`
	Views     int                  `bson:"views" json:"views"`
	SavedBy   []primitive.ObjectID `bson:"saved_by" json:"saved_by"`
	Reports   []primitive.ObjectID `bson:"reports" json:"reports"`
	CreatedAt time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time            `bson:"updated_at" json:"updated_at"`
	IsDeleted bool                 `bson:"is_deleted" json:"is_deleted"`
}
