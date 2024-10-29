package controllers

import (
	"context"
	"errors"
	"go-gin/config"
	"go-gin/models"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Secret key for signing JWTs
var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

// Claims defines JWT structure
type Claims struct {
	UserID string `json:"userId"`
	jwt.StandardClaims
}

// Register handles user registration
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.DB.Collection("users")
	var existingUser models.User
	err := collection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already registered"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)
	user.ID = primitive.NewObjectID()
	user.JoinedAt = time.Now()

	_, err = collection.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully!"})
}

// Login handles user authentication and returns JWT tokens
func Login(c *gin.Context) {
	var user models.User
	var foundUser models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.DB.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Create JWT access and refresh tokens
	accessToken, _, err := CreateJWT(foundUser.ID.Hex(), 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	refreshToken, _, err := CreateJWT(foundUser.ID.Hex(), 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	// Send tokens in JSON response
	c.JSON(http.StatusOK, gin.H{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
	})
}

// CreateJWT generates a JWT token for the user
func CreateJWT(userID string, duration time.Duration) (string, time.Duration, error) {
	expirationTime := time.Now().Add(duration)
	claims := &Claims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", 0, err
	}

	return tokenString, duration, nil
}

// RefreshToken generates a new access token if refresh token is valid
func RefreshToken(c *gin.Context) {
	refreshToken := c.GetHeader("Authorization")
	if refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing refresh token"})
		return
	}

	claims, err := VerifyJWT(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	accessToken, _, err := CreateJWT(claims.UserID, 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"accessToken": accessToken})
}

// VerifyJWT validates the JWT token
func VerifyJWT(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// Logout clears the tokens on the frontend by instructing the client
func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully. Clear tokens on the client-side."})
}

// GetCurrentUser retrieves the current user's data based on the JWT token
func GetCurrentUser(c *gin.Context) {
	accessToken := c.GetHeader("Authorization")
	if accessToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing access token"})
		return
	}

	claims, err := VerifyJWT(accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
		return
	}

	collection := config.DB.Collection("users")
	var user models.User
	objectID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"user": user})
}
