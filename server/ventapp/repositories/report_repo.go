package repositories

import (
	"context"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ReportRepository struct{ col string }

func NewReportRepository() *ReportRepository { return &ReportRepository{col: "reports"} }

func (r *ReportRepository) Create(ctx context.Context, rep *models.Report) error {
	rep.ID = primitive.NewObjectID()
	rep.CreatedAt = time.Now()
	rep.Resolved = false
	_, err := config.DB.Collection(r.col).InsertOne(ctx, rep)
	return err
}
