package config

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
var Client *mongo.Client

// Connect connects to MongoDB using the provided URI and database name.
func Connect(uri, dbName string) error {
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := client.Connect(ctx); err != nil {
		return err
	}

	DB = client.Database(dbName)
	Client = client
	log.Printf("Connected to MongoDB: %s/%s", uri, dbName)
	return nil
}

func Disconnect() error {
	if Client == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return Client.Disconnect(ctx)
}

// AppConfig holds configuration values for the application
type AppConfig struct {
	MongoURI string
	DBName   string
	Port     string
}

func DefaultConfig() AppConfig {
	return AppConfig{
		MongoURI: "mongodb://localhost:27017",
		DBName:   "ventapp",
		Port:     "8080",
	}
}
