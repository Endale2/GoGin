package controllers

import (
	"context"
	"net/http"
	"time"
	"go-gin/models"
	"go-gin/websocket"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetPosts(c *gin.Context) {
	// Get query parameters
	sort := c.Query("sort")
	search := c.Query("search")
	if sort == "" {
		sort = "new" // default sort
	}

	// Build filter
	filter := bson.M{"is_deleted": false}
	
	// Add search filter if provided
	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"content": bson.M{"$regex": search, "$options": "i"}},
			{"tags": bson.M{"$in": []string{search}}},
		}
	}

	// Build sort options
	var sortOptions *options.FindOptions
	switch sort {
	case "hot":
		sortOptions = options.Find().SetSort(bson.D{{Key: "score", Value: -1}})
	case "top":
		sortOptions = options.Find().SetSort(bson.D{{Key: "upvotes", Value: -1}})
	case "new":
		sortOptions = options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	default:
		sortOptions = options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	}

	// Add limit
	sortOptions.SetLimit(50)

	// Find posts
	cursor, err := postCollection.Find(context.Background(), filter, sortOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching posts"})
		return
	}
	defer cursor.Close(context.Background())

	var posts []models.Post
	if err = cursor.All(context.Background(), &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding posts"})
		return
	}

	// Populate author information for each post
	for i := range posts {
		var user models.User
		err := userCollection.FindOne(context.Background(), bson.M{"_id": posts[i].AuthorID}).Decode(&user)
		if err == nil {
			posts[i].Author = user
		}
	}

	c.JSON(http.StatusOK, posts)
}

func GetPost(c *gin.Context) {
	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "is_deleted": false}).Decode(&post)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching post"})
		}
		return
	}

	// Populate author information
	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"_id": post.AuthorID}).Decode(&user)
	if err == nil {
		post.Author = user
	}

	c.JSON(http.StatusOK, post)
}

func CreatePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set post data
	post.AuthorID, _ = primitive.ObjectIDFromHex(userID.(string))
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	post.Upvotes = 0
	post.Downvotes = 0
	post.Score = 0
	post.Comments = 0
	post.IsDeleted = false

	// Get author info
	var user models.User
	err := userCollection.FindOne(context.Background(), bson.M{"_id": post.AuthorID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user"})
		return
	}
	post.Author = user

	result, err := postCollection.InsertOne(context.Background(), post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating post"})
		return
	}

	post.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, post)
}

func UpdatePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var updateData struct {
		Title   string   `json:"title"`
		Content string   `json:"content"`
		Tags    []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user owns the post
	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "author_id": userID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own posts"})
		return
	}

	// Update post
	update := bson.M{
		"$set": bson.M{
			"title":     updateData.Title,
			"content":   updateData.Content,
			"tags":      updateData.Tags,
			"updated_at": time.Now(),
		},
	}

	_, err = postCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post updated successfully"})
}

func DeletePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if user owns the post
	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "author_id": userID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own posts"})
		return
	}

	// Soft delete
	_, err = postCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, bson.M{"$set": bson.M{"is_deleted": true}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

func VotePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	voteType := c.Param("type") // "upvote" or "downvote"

	// Check if post exists
	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "is_deleted": false}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Update vote count
	var update bson.M
	if voteType == "upvote" {
		update = bson.M{
			"$inc": bson.M{
				"upvotes": 1,
				"score":   1,
			},
		}
	} else if voteType == "downvote" {
		update = bson.M{
			"$inc": bson.M{
				"downvotes": 1,
				"score":     -1,
			},
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vote type"})
		return
	}

	_, err = postCollection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error voting on post"})
		return
	}

	// Return updated post data
	var updatedPost models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&updatedPost)
	if err == nil {
		// Populate author information
		var user models.User
		err = userCollection.FindOne(context.Background(), bson.M{"_id": updatedPost.AuthorID}).Decode(&user)
		if err == nil {
			updatedPost.Author = user
		}
		
		// Broadcast real-time update via WebSocket
		if hub != nil {
			hub.BroadcastMessage(websocket.Message{
				Type: websocket.MessageTypeVote,
				Data: map[string]interface{}{
					"post_id":   postID,
					"vote_type": voteType,
					"upvotes":   updatedPost.Upvotes,
					"downvotes": updatedPost.Downvotes,
					"score":     updatedPost.Score,
				},
				UserID:    userID.(string),
				Timestamp: time.Now(),
			})
		}
		
		c.JSON(http.StatusOK, updatedPost)
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Vote recorded successfully"})
	}
}

func SavePost(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists
	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "is_deleted": false}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// For now, just return success (you can implement actual save functionality later)
	c.JSON(http.StatusOK, gin.H{"message": "Post saved successfully", "saved": true})
}

func UnsavePost(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists
	var post models.Post
	err = postCollection.FindOne(context.Background(), bson.M{"_id": objectID, "is_deleted": false}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// For now, just return success (you can implement actual unsave functionality later)
	c.JSON(http.StatusOK, gin.H{"message": "Post unsaved successfully", "saved": false})
}

func FilterPosts(c *gin.Context) {
	var filter struct {
		Sort   string `json:"sort"`
		Search string `json:"search"`
		Type   string `json:"type"`
	}

	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filter data"})
		return
	}

	// Set defaults
	sort := filter.Sort
	if sort == "" {
		sort = "new"
	}
	search := filter.Search

	// Build filter
	dbFilter := bson.M{"is_deleted": false}
	
	// Add search filter if provided
	if search != "" {
		dbFilter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"content": bson.M{"$regex": search, "$options": "i"}},
			{"tags": bson.M{"$in": []string{search}}},
		}
	}

	// Build sort options
	var sortOptions *options.FindOptions
	switch sort {
	case "hot":
		sortOptions = options.Find().SetSort(bson.D{{Key: "score", Value: -1}})
	case "top":
		sortOptions = options.Find().SetSort(bson.D{{Key: "upvotes", Value: -1}})
	case "new":
		sortOptions = options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	default:
		sortOptions = options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	}

	// Add limit
	sortOptions.SetLimit(50)

	// Find posts
	cursor, err := postCollection.Find(context.Background(), dbFilter, sortOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching posts"})
		return
	}
	defer cursor.Close(context.Background())

	var posts []models.Post
	if err = cursor.All(context.Background(), &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding posts"})
		return
	}

	// Populate author information for each post
	for i := range posts {
		var user models.User
		err := userCollection.FindOne(context.Background(), bson.M{"_id": posts[i].AuthorID}).Decode(&user)
		if err == nil {
			posts[i].Author = user
		}
	}

	c.JSON(http.StatusOK, posts)
} 