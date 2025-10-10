package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// TODO: Implement Telegram Web auth flow. This controller will accept a Telegram auth payload
// (signed data), validate it, create or find a user, and return a session token (or set cookie).

func TelegramLogin(c *gin.Context) {
	// Placeholder - parse payload, validate signature using bot token, upsert user, return token
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Telegram login not implemented"})
}
