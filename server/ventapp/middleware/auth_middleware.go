package middleware

import (
	"net/http"

	"ventapp/server/ventapp/config"

	"github.com/gin-gonic/gin"
)

const ContextUserIDKey = "user_id"

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.Next()
			return
		}

		// expecting "Bearer <token>"
		var token string
		if len(auth) > 7 && auth[:7] == "Bearer " {
			token = auth[7:]
		}
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid auth header"})
			return
		}

		claims, err := config.ParseToken(token)
		if err != nil || claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		if sub, ok := claims["sub"].(string); ok {
			c.Set(ContextUserIDKey, sub)
		}
		c.Next()
	}
}
