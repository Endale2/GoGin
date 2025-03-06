package controllers

import (
	"fmt"
	"context"
	"errors"
	"go-gin/config"
	"go-gin/models"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	UserID string `json:"userId"`
	jwt.StandardClaims
}

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

func Login(c *gin.Context) {
	var user models.User
	var foundUser models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.DB.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&foundUser)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	accessToken, accessDuration, err := CreateJWT(foundUser.ID.Hex(), 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	refreshToken, refreshDuration, err := CreateJWT(foundUser.ID.Hex(), 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	c.SetCookie("accessToken", accessToken, int(accessDuration.Seconds()), "/", "localhost", false, true)
	c.SetCookie("refreshToken", refreshToken, int(refreshDuration.Seconds()), "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful!"})
}

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

func RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie("refreshToken")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token missing"})
		return
	}

	claims, err := VerifyJWT(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	accessToken, accessDuration, err := CreateJWT(claims.UserID, 15*time.Minute)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	c.SetCookie("accessToken", accessToken, int(accessDuration.Seconds()), "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Access token refreshed"})
}

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

func Logout(c *gin.Context) {
	c.SetCookie("accessToken", "", -1, "/", "localhost", false, true)
	c.SetCookie("refreshToken", "", -1, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func GetCurrentUser(c *gin.Context) {
	accessToken, err := c.Cookie("accessToken")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Access token missing"})
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



func EditProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	collection := config.DB.Collection("users")
	objID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Parse form data
	name := c.PostForm("name")
	email := c.PostForm("email")
	phoneNumber := c.PostForm("phone_number")

	updateFields := bson.M{}
	if name != "" {
		updateFields["name"] = name
	}
	if email != "" {
		updateFields["email"] = email
	}
	if phoneNumber != "" {
		updateFields["phone_number"] = phoneNumber
	}

	// Handle image upload
	file, err := c.FormFile("image")
	if err == nil {
		filePath, err := saveImage(c,file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Image upload failed"})
			return
		}
		updateFields["profile_image"] = filePath
	}

	update := bson.M{"$set": updateFields}
	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func saveImage(c *gin.Context, file *multipart.FileHeader) (string, error) {
	dir := "uploads"
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return "", err
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(file.Filename))
	filePath := filepath.Join(dir, fileName)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		return "", err
	}

	return filePath, nil
}

