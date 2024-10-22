package middleware

import (
	"go-gin/controllers"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		// Extract the token from the "Bearer" scheme
		tokenString := strings.Split(authHeader, "Bearer ")[1]

		// Verify the token
		claims, err := controllers.VerifyToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized - invalid token"})
			c.Abort()
			return
		}

		// Set the user ID from the token claims
		c.Set("userID", claims.Subject)
		c.Next()
	}
}
