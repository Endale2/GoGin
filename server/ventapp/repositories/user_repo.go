package repositories

import (
	"context"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserRepository struct {
	colCollectionName string
}

func NewUserRepository() *UserRepository {
	return &UserRepository{colCollectionName: "users"}
}

func (r *UserRepository) Create(ctx context.Context, u *models.User) error {
	u.ID = primitive.NewObjectID()
	now := time.Now()
	u.CreatedAt = now
	u.LastSeenAt = now
	_, err := config.DB.Collection(r.colCollectionName).InsertOne(ctx, u)
	return err
}

func (r *UserRepository) FindByTelegramID(ctx context.Context, tgID int64) (*models.User, error) {
	var u models.User
	err := config.DB.Collection(r.colCollectionName).FindOne(ctx, bson.M{"telegram_id": tgID}).Decode(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
