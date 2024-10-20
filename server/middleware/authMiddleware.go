package middleware

import (
	"go-gin/controllers"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks for the JWT in cookies and verifies it
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the JWT token from cookies
		token, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
			c.Abort()
			return
		}

		// Verify the token
		claims, err := controllers.VerifyToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user ID in context for further use
		c.Set("userID", claims.Subject)

		// Proceed to the next middleware or handler
		c.Next()
	}
}
