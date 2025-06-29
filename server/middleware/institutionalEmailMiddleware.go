package middleware

import (
	"go-gin/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// InstitutionalEmailMiddleware ensures that users are using institutional emails
func InstitutionalEmailMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user email from context (set by auth middleware)
		_, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// For now, we'll let the auth middleware handle the user validation
		// This middleware can be extended to check if the user's email is still valid
		// or if they need to update their institutional email
		
		c.Next()
	}
}

// ValidateInstitutionalEmail is a helper function to validate email format
func ValidateInstitutionalEmail(email string) bool {
	return utils.IsInstitutionalEmail(email)
} 