package controllers

import (
	"context"
	"net/http"
	"time"
	"go-gin/models"
	"go-gin/websocket"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetComments(c *gin.Context) {
	postID := c.Param("postId")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Get top-level comments (no parent_id) for this post, sorted by score (best first)
	filter := bson.M{"post_id": objectID, "is_deleted": false, "parent_id": bson.M{"$exists": false}}
	sortOptions := options.Find().SetSort(bson.D{{Key: "score", Value: -1}})

	cursor, err := commentCollection.Find(context.Background(), filter, sortOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching comments"})
		return
	}
	defer cursor.Close(context.Background())

	var comments []models.Comment
	if err = cursor.All(context.Background(), &comments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding comments"})
		return
	}

	// Populate author information for each comment
	for i := range comments {
		var user models.User
		err := userCollection.FindOne(context.Background(), bson.M{"_id": comments[i].AuthorID}).Decode(&user)
		if err == nil {
			comments[i].Author = user
		}

		// Get replies for this comment
		repliesFilter := bson.M{"post_id": objectID, "parent_id": comments[i].ID, "is_deleted": false}
		repliesCursor, err := commentCollection.Find(context.Background(), repliesFilter, options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}}))
		if err == nil {
			var replies []models.Comment
			if err = repliesCursor.All(context.Background(), &replies); err == nil {
				// Populate author info for replies
				for j := range replies {
					var replyUser models.User
					if err := userCollection.FindOne(context.Background(), bson.M{"_id": replies[j].AuthorID}).Decode(&replyUser); err == nil {
						replies[j].Author = replyUser
					}
				}
				comments[i].Replies = replies
			}
			repliesCursor.Close(context.Background())
		}
	}

	c.JSON(http.StatusOK, comments)
}

func CreateComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postID := c.Param("postId")
	postObjectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Received comment data: %+v", comment)

	// Set comment data
	comment.PostID = postObjectID
	comment.AuthorID, _ = primitive.ObjectIDFromHex(userID.(string))
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()
	comment.Upvotes = 0
	comment.Downvotes = 0
	comment.Score = 0
	comment.IsDeleted = false

	// Handle parent_id for replies
	if comment.ParentID != nil {
		log.Printf("Creating reply with parent_id: %v", comment.ParentID)
		// Validate that the parent comment exists
		var parentComment models.Comment
		err = commentCollection.FindOne(context.Background(), bson.M{"_id": *comment.ParentID, "is_deleted": false}).Decode(&parentComment)
		if err != nil {
			log.Printf("Parent comment not found: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parent comment not found"})
			return
		}
		log.Printf("Parent comment found: %s", parentComment.ID.Hex())
	} else {
		log.Printf("Creating top-level comment")
	}

	// Get author info
	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"_id": comment.AuthorID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user"})
		return
	}
	comment.Author = user

	// Insert comment
	result, err := commentCollection.InsertOne(context.Background(), comment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating comment"})
		return
	}

	// Update post comment count
	_, err = postCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": postObjectID},
		bson.M{"$inc": bson.M{"comments": 1}},
	)

	comment.ID = result.InsertedID.(primitive.ObjectID)
	
	// Broadcast real-time update via WebSocket
	if hub != nil {
		hub.BroadcastMessage(websocket.Message{
			Type: websocket.MessageTypeComment,
			Data: map[string]interface{}{
				"comment":   comment,
				"post_id":   postID,
				"action":    "created",
			},
			UserID:    userID.(string),
			Username:  user.Email, // Using email as username
			Timestamp: time.Now(),
		})
	}
	
	c.JSON(http.StatusCreated, comment)
}

func UpdateComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	commentID := c.Param("commentId")
	commentObjectID, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var updateData struct {
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user owns the comment
	var comment models.Comment
	err = commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID, "author_id": userID}).Decode(&comment)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own comments"})
		return
	}

	// Update comment
	update := bson.M{
		"$set": bson.M{
			"content":    updateData.Content,
			"updated_at": time.Now(),
		},
	}

	_, err = commentCollection.UpdateOne(context.Background(), bson.M{"_id": commentObjectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment updated successfully"})
}

func DeleteComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	commentID := c.Param("commentId")
	commentObjectID, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	// Check if user owns the comment and get comment data
	var comment models.Comment
	err = commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID, "author_id": userID}).Decode(&comment)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own comments"})
		return
	}

	// Soft delete
	_, err = commentCollection.UpdateOne(context.Background(), bson.M{"_id": commentObjectID}, bson.M{"$set": bson.M{"is_deleted": true}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting comment"})
		return
	}

	// Update post comment count
	_, err = postCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": comment.PostID},
		bson.M{"$inc": bson.M{"comments": -1}},
	)

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

func VoteComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	commentID := c.Param("commentId")
	commentObjectID, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	voteType := c.Param("type") // "upvote" or "downvote"

	// Check if comment exists
	var comment models.Comment
	err = commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID, "is_deleted": false}).Decode(&comment)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
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

	_, err = commentCollection.UpdateOne(context.Background(), bson.M{"_id": commentObjectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error voting on comment"})
		return
	}

	// Return updated comment data
	var updatedComment models.Comment
	err = commentCollection.FindOne(context.Background(), bson.M{"_id": commentObjectID}).Decode(&updatedComment)
	if err == nil {
		// Populate author information
		var user models.User
		err = userCollection.FindOne(context.Background(), bson.M{"_id": updatedComment.AuthorID}).Decode(&user)
		if err == nil {
			updatedComment.Author = user
		}
		
		// Broadcast real-time update via WebSocket
		if hub != nil {
			hub.BroadcastMessage(websocket.Message{
				Type: websocket.MessageTypeVote,
				Data: map[string]interface{}{
					"comment_id": commentID,
					"vote_type":  voteType,
					"upvotes":    updatedComment.Upvotes,
					"downvotes":  updatedComment.Downvotes,
					"score":      updatedComment.Score,
				},
				UserID:    userID.(string),
				Timestamp: time.Now(),
			})
		}
		
		c.JSON(http.StatusOK, updatedComment)
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Vote recorded successfully"})
	}
} 