package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type University struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string             `bson:"name" json:"name" validate:"required"`         // University name
	Location    string             `bson:"location" json:"location" validate:"required"` // University location
	Departments []string           `bson:"departments" json:"departments,omitempty"`     // List of department names
	Established int                `bson:"established" json:"established,omitempty"`     // Year the university was established
	Website     string             `bson:"website" json:"website,omitempty"`             // University website URL
}
