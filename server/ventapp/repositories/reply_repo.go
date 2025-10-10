package repositories

import (
	"context"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReplyRepository struct{ col string }

func NewReplyRepository() *ReplyRepository { return &ReplyRepository{col: "replies"} }

func (r *ReplyRepository) Create(ctx context.Context, rep *models.Reply) error {
	rep.ID = primitive.NewObjectID()
	now := time.Now()
	rep.CreatedAt = now
	rep.UpdatedAt = now
	_, err := config.DB.Collection(r.col).InsertOne(ctx, rep)
	return err
}
