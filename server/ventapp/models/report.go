package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Report struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	VentID    primitive.ObjectID `bson:"vent_id" json:"vent_id"`
	Reporter  primitive.ObjectID `bson:"reporter" json:"reporter"`
	Reason    string             `bson:"reason" json:"reason"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	Resolved  bool               `bson:"resolved" json:"resolved"`
}
