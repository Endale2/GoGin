package config

import (
    "time"
    "os"

    jwt "github.com/golang-jwt/jwt/v5"
)
var jwtSecret []byte

func init() {
    s := os.Getenv("JWT_SECRET")
    if s == "" {
        s = "replace-with-secure-secret"
    }
    jwtSecret = []byte(s)
}

func GenerateToken(userID string, expiry time.Duration) (string, error) {
    claims := jwt.MapClaims{
        "sub": userID,
        "exp": time.Now().Add(expiry).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func ParseToken(tokenStr string) (jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil {
        return nil, err
    }
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims, nil
    }
    return nil, nil
}
