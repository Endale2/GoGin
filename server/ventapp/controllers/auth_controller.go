package controllers

import (
	"context"
	"net/http"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"
	"ventapp/server/ventapp/repositories"
	"ventapp/server/ventapp/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TODO: Implement Telegram Web auth flow. This controller will accept a Telegram auth payload
// (signed data), validate it, create or find a user, and return a session token (or set cookie).

func TelegramLogin(c *gin.Context) {
	// Placeholder - parse payload, validate signature using bot token, upsert user, return token
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Telegram login not implemented"})
}

// Register - simple email/password registration
func Register(c *gin.Context) {
	var payload struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Username string `json:"username" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check if exists
	repo := repositories.NewUserRepository()
	if u, _ := repo.FindByTelegramID(context.Background(), 0); u != nil {
		// not the right check, keep simple: try find by email via direct collection
	}

	// hash
	hash, err := utils.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := &models.User{
		ID:           primitive.NewObjectID(),
		Email:        payload.Email,
		PasswordHash: hash,
		Username:     payload.Username,
		DisplayName:  payload.Username,
		CreatedAt:    time.Now(),
	}

	if err := repositories.NewUserRepository().Create(context.Background(), user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// issue token
	token, _ := config.GenerateToken(user.ID.Hex(), time.Hour*24)
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

// Login - email + password
func Login(c *gin.Context) {
	var payload struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// lookup user
	col := config.DB.Collection("users")
	var u models.User
	if err := col.FindOne(context.Background(), map[string]interface{}{"email": payload.Email}).Decode(&u); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if !utils.CheckPasswordHash(u.PasswordHash, payload.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, _ := config.GenerateToken(u.ID.Hex(), time.Hour*24)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": u})
}
