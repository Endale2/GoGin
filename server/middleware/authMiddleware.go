package middleware

import (
	"go-gin/controllers"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware is the JWT authentication middleware
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for access token in the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or invalid"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		accessToken := strings.TrimPrefix(authHeader, "Bearer ")

		// Verify the access token
		claims, err := controllers.VerifyJWT(accessToken)
		if err != nil {
			// Access token is invalid or expired
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
			c.Abort()
			return
		}

		// Set user ID in context to be used by the handler
		c.Set("userID", claims.UserID)
		c.Next()
	}
}
