package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reply struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	VentID    primitive.ObjectID  `bson:"vent_id" json:"vent_id"`
	AuthorID  primitive.ObjectID  `bson:"author_id" json:"author_id"`
	Content   string              `bson:"content" json:"content"`
	ParentID  *primitive.ObjectID `bson:"parent_id,omitempty" json:"parent_id,omitempty"`
	Upvotes   int                 `bson:"upvotes" json:"upvotes"`
	Downvotes int                 `bson:"downvotes" json:"downvotes"`
	CreatedAt time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time           `bson:"updated_at" json:"updated_at"`
	IsDeleted bool                `bson:"is_deleted" json:"is_deleted"`
}
