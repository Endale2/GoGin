package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TelegramID  int64              `bson:"telegram_id" json:"telegram_id"`
	Username    string             `bson:"username" json:"username"`
	DisplayName string             `bson:"display_name" json:"display_name"`
	AvatarURL   string             `bson:"avatar_url" json:"avatar_url"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	LastSeenAt  time.Time          `bson:"last_seen_at" json:"last_seen_at"`
	IsAdmin     bool               `bson:"is_admin" json:"is_admin"`
}
