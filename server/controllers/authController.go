package controllers

import (
	"context"
	"errors"
	"go-gin/config"
	"go-gin/models"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Secret key to sign the JWT (use environment variables in production)
var jwtKey = []byte("secret_key")

// Register handles user registration
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the users collection from MongoDB
	collection := config.DB.Collection("users")

	// Check if the user already exists by username
	var existingUser models.User
	err := collection.FindOne(context.Background(), bson.M{"username": user.Username}).Decode(&existingUser)
	if err == nil {
		// If no error, the user already exists
		c.JSON(http.StatusConflict, gin.H{"error": "User already registered"})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Assign a new MongoDB ObjectID and set created time
	user.ID = primitive.NewObjectID()
	user.CreatedAt = time.Now()

	// Insert the user into MongoDB
	_, err = collection.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully!"})
}

// Login handles user authentication and JWT generation
func Login(c *gin.Context) {
	var user models.User
	var foundUser models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find the user in MongoDB
	collection := config.DB.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"username": user.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Compare the provided password with the hashed password stored in MongoDB
	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	// Create JWT token
	token, err := CreateToken(foundUser.ID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Set the token as an HTTP-only cookie
	c.SetCookie("token", token, 36000000, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Login successful!"})
}

// CreateToken generates a new JWT token for the authenticated user
func CreateToken(userID string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // Set token expiration time
	claims := &jwt.StandardClaims{
		Subject:   userID,
		ExpiresAt: expirationTime.Unix(),
	}

	// Create the token using HS256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// VerifyToken checks if the provided JWT token is valid
func VerifyToken(tokenString string) (*jwt.StandardClaims, error) {
	claims := &jwt.StandardClaims{}

	// Parse the token with the secret key
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	// If token is invalid or expired, return an error
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	// Return the claims if the token is valid
	return claims, nil
}
