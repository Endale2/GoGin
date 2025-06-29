package utils

import (
	"strings"
	"regexp"
)

// IsInstitutionalEmail validates if the email is from an Ethiopian educational institution (.edu.et domain)
func IsInstitutionalEmail(email string) bool {
	// Convert to lowercase for case-insensitive comparison
	email = strings.ToLower(email)
	
	// Check if email ends with .edu.et
	if !strings.HasSuffix(email, ".edu.et") {
		return false
	}
	
	// Basic email format validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return false
	}
	
	// Extract domain part
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}
	
	domain := parts[1]
	
	// Validate the domain structure for .edu.et
	// Should be something like: university.edu.et or subdomain.university.edu.et
	domainParts := strings.Split(domain, ".")
	if len(domainParts) < 3 {
		return false
	}
	
	// Check if it ends with edu.et
	if domainParts[len(domainParts)-2] != "edu" || domainParts[len(domainParts)-1] != "et" {
		return false
	}
	
	// The institution name should be at least 2 characters
	if len(domainParts) >= 3 && len(domainParts[len(domainParts)-3]) < 2 {
		return false
	}
	
	return true
}

// GetInstitutionFromEmail extracts the institution name from an institutional email
func GetInstitutionFromEmail(email string) string {
	if !IsInstitutionalEmail(email) {
		return ""
	}
	
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return ""
	}
	
	domain := parts[1]
	domainParts := strings.Split(domain, ".")
	
	// Remove .edu.et and join the remaining parts
	if len(domainParts) >= 3 {
		institutionParts := domainParts[:len(domainParts)-2]
		return strings.Join(institutionParts, ".")
	}
	
	return ""
}

// ValidatePasswordStrength validates password strength
func ValidatePasswordStrength(password string) (bool, string) {
	if len(password) < 8 {
		return false, "Password must be at least 8 characters long"
	}
	
	// Check for at least one uppercase letter
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		return false, "Password must contain at least one uppercase letter"
	}
	
	// Check for at least one lowercase letter
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		return false, "Password must contain at least one lowercase letter"
	}
	
	// Check for at least one number
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		return false, "Password must contain at least one number"
	}
	
	return true, ""
} 