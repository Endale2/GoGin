package repositories

import (
	"context"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type VentRepository struct {
	col string
}

func NewVentRepository() *VentRepository { return &VentRepository{col: "vents"} }

func (r *VentRepository) Create(ctx context.Context, v *models.Vent) error {
	v.ID = primitive.NewObjectID()
	now := time.Now()
	v.CreatedAt = now
	v.UpdatedAt = now
	_, err := config.DB.Collection(r.col).InsertOne(ctx, v)
	return err
}

func (r *VentRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Vent, error) {
	var v models.Vent
	if err := config.DB.Collection(r.col).FindOne(ctx, bson.M{"_id": id, "is_deleted": false}).Decode(&v); err != nil {
		return nil, err
	}
	return &v, nil
}

// FindRecent returns the most recent vents up to limit
func (r *VentRepository) FindRecent(ctx context.Context, limit int64) ([]models.Vent, error) {
	opts := &options.FindOptions{}
	opts.SetSort(bson.D{{Key: "created_at", Value: -1}})
	opts.SetLimit(limit)

	cursor, err := config.DB.Collection(r.col).Find(ctx, bson.M{"is_deleted": false}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var vents []models.Vent
	if err := cursor.All(ctx, &vents); err != nil {
		return nil, err
	}
	return vents, nil
}
