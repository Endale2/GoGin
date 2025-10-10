package util

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"ventapp/server/ventapp/config"
	"ventapp/server/ventapp/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RunSeed() {
	rand.Seed(time.Now().UnixNano())

	cfg := config.DefaultConfig()
	if err := config.Connect(cfg.MongoURI, cfg.DBName); err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer config.Disconnect()

	// simplified seeding
	userCol := config.DB.Collection("users")
	ventCol := config.DB.Collection("vents")

	var userIDs []primitive.ObjectID
	for i := 0; i < 3; i++ {
		u := models.User{
			ID:          primitive.NewObjectID(),
			TelegramID:  int64(1000 + i),
			Username:    fmt.Sprintf("user%d", i+1),
			DisplayName: fmt.Sprintf("User %d", i+1),
			AvatarURL:   "",
			CreatedAt:   time.Now(),
			LastSeenAt:  time.Now(),
			IsAdmin:     false,
		}
		if _, err := userCol.InsertOne(context.Background(), u); err != nil {
			log.Printf("insert user err: %v", err)
			continue
		}
		userIDs = append(userIDs, u.ID)
	}

	if len(userIDs) == 0 {
		log.Println("no users inserted, aborting vents seeding")
		return
	}

	tags := [][]string{{"rant"}, {"vent"}, {"work"}, {"life"}}
	for i := 0; i < 10; i++ {
		v := models.Vent{
			ID:        primitive.NewObjectID(),
			AuthorID:  userIDs[rand.Intn(len(userIDs))],
			Content:   fmt.Sprintf("Sample vent content #%d", i+1),
			Tags:      tags[rand.Intn(len(tags))],
			Upvotes:   rand.Intn(30),
			Downvotes: rand.Intn(10),
			Views:     rand.Intn(100),
			SavedBy:   []primitive.ObjectID{},
			Reports:   []primitive.ObjectID{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}
		if _, err := ventCol.InsertOne(context.Background(), v); err != nil {
			log.Printf("failed to insert vent: %v", err)
			continue
		}
	}

	fmt.Printf("Inserted %d users and 10 vents\n", len(userIDs))
}
