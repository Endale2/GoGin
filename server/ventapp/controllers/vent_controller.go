package controllers

import (
	"context"
	"net/http"
	"time"

	"ventapp/server/ventapp/models"
	"ventapp/server/ventapp/repositories"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var ventRepo = repositories.NewVentRepository()

// CreateVentRequest - payload when creating a vent
type CreateVentRequest struct {
	AuthorID string   `json:"author_id" binding:"required"`
	Content  string   `json:"content" binding:"required,min=1"`
	Tags     []string `json:"tags"`
}

func CreateVent(c *gin.Context) {
	var req CreateVentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert author id to ObjectID
	authorOID, err := primitive.ObjectIDFromHex(req.AuthorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid author_id"})
		return
	}

	vent := &models.Vent{
		AuthorID:  authorOID,
		Content:   req.Content,
		Tags:      req.Tags,
		Upvotes:   0,
		Downvotes: 0,
		Views:     0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		IsDeleted: false,
	}

	if err := ventRepo.Create(context.Background(), vent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create vent"})
		return
	}

	c.JSON(http.StatusCreated, vent)
}

func GetVents(c *gin.Context) {
	// Very simple: return last N vents
	cursor, err := repositories.NewVentRepository().FindRecent(context.Background(), 50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch vents"})
		return
	}
	c.JSON(http.StatusOK, cursor)
}
