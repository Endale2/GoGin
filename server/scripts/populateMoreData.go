package main

import (
    "context"
    "fmt"
    "log"
    "math/rand"
    "time"

    "go-gin/config"
    "go-gin/models"
    "go-gin/utils"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
    rand.Seed(time.Now().UnixNano())

    // Connect to DB
    config.ConnectDB()
    defer config.DisconnectDB()

    ctx, cancel := config.GetContext()
    defer cancel()

    // Create sample users
    userIDs := createUsers(ctx)

    // Ensure there are course IDs available
    courseIDs := ensureCourses(ctx)

    // Create sample posts
    postIDs := createPosts(ctx, userIDs)

    // Create sample questions
    questionIDs := createQuestions(ctx, userIDs, courseIDs)

    // Create sample comments for posts
    createComments(ctx, userIDs, postIDs)

    fmt.Printf("Inserted %d users, %d posts, %d questions.\n", len(userIDs), len(postIDs), len(questionIDs))
}

func createUsers(ctx context.Context) []primitive.ObjectID {
    col := config.DB.Collection("users")

    // Optionally clear existing test users with a specific prefix (keep safe)
    // We'll not delete all users to avoid removing real data.

    sampleEmails := []string{
        "alice@example.edu",
        "bob@example.edu",
        "carol@example.edu",
    }

    var ids []primitive.ObjectID
    for _, email := range sampleEmails {
        hashed, err := utils.HashPassword("password123")
        if err != nil {
            log.Printf("error hashing password: %v", err)
            continue
        }

        user := models.User{
            ID:        primitive.NewObjectID(),
            Email:     email,
            Password:  hashed,
            CreatedAt: time.Now(),
            LastActive: time.Now(),
            Karma:     rand.Intn(100),
        }

        // Upsert: if a user with same email exists, skip insert and push existing id
        var existing models.User
        err = col.FindOne(ctx, bson.M{"email": email}).Decode(&existing)
        if err == nil {
            ids = append(ids, existing.ID)
            log.Printf("user already exists: %s", email)
            continue
        }

        _, err = col.InsertOne(ctx, user)
        if err != nil {
            log.Printf("failed to insert user %s: %v", email, err)
            continue
        }

        ids = append(ids, user.ID)
        log.Printf("inserted user: %s", email)
    }

    return ids
}

func ensureCourses(ctx context.Context) []primitive.ObjectID {
    col := config.DB.Collection("courses")
    cursor, err := col.Find(ctx, bson.M{})
    if err != nil {
        log.Printf("error finding courses: %v", err)
        return nil
    }
    defer cursor.Close(ctx)

    var ids []primitive.ObjectID
    for cursor.Next(ctx) {
        var doc bson.M
        if err := cursor.Decode(&doc); err == nil {
            if id, ok := doc["_id"].(primitive.ObjectID); ok {
                ids = append(ids, id)
            }
        }
    }

    // If there are already courses, return their IDs
    if len(ids) > 0 {
        return ids
    }

    // Otherwise insert a small set from utils.SampleCourses
    for i, c := range utils.SampleCourses {
        title, _ := c["title"].(string)
        course := models.Course{
            ID:    primitive.NewObjectID(),
            Title: title,
        }
        _, err := col.InsertOne(ctx, course)
        if err != nil {
            log.Printf("failed to insert course %s: %v", title, err)
            continue
        }
        ids = append(ids, course.ID)
        // insert a few only to avoid huge insertion
        if i >= 9 {
            break
        }
    }

    return ids
}

func createPosts(ctx context.Context, userIDs []primitive.ObjectID) []primitive.ObjectID {
    if len(userIDs) == 0 {
        log.Println("no users available to create posts")
        return nil
    }

    col := config.DB.Collection("posts")
    tagsPool := []string{"help", "homework", "announcement", "project", "exam", "tips"}

    var postIDs []primitive.ObjectID
    for i := 0; i < 10; i++ {
        authorIdx := rand.Intn(len(userIDs))
        email := "user" + fmt.Sprint(i) + "@example.edu"

        // Build an author object (minimal)
        author := models.User{
            ID:    userIDs[authorIdx],
            Email: email,
        }

        p := models.Post{
            ID:        primitive.NewObjectID(),
            Title:     fmt.Sprintf("Sample post #%d", i+1),
            Content:   fmt.Sprintf("This is a sample post content number %d. It is generated for testing.", i+1),
            AuthorID:  userIDs[authorIdx],
            Author:    author,
            Tags:      []string{tagsPool[rand.Intn(len(tagsPool))]},
            Upvotes:   rand.Intn(50),
            Downvotes: rand.Intn(20),
            Score:     0,
            Comments:  0,
            IsDeleted: false,
            CreatedAt: time.Now(),
            UpdatedAt: time.Now(),
        }

        // compute score
        p.Score = p.Upvotes - p.Downvotes

        res, err := col.InsertOne(ctx, p)
        if err != nil {
            log.Printf("failed to insert post: %v", err)
            continue
        }

        if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
            postIDs = append(postIDs, oid)
        }
        log.Printf("inserted post: %s", p.Title)
    }

    return postIDs
}

func createQuestions(ctx context.Context, userIDs, courseIDs []primitive.ObjectID) []primitive.ObjectID {
    if len(userIDs) == 0 || len(courseIDs) == 0 {
        log.Println("users or courses not available to create questions")
        return nil
    }

    col := config.DB.Collection("questions")

    var qIDs []primitive.ObjectID
    for i := 0; i < 10; i++ {
        uid := userIDs[rand.Intn(len(userIDs))]
        cid := courseIDs[rand.Intn(len(courseIDs))]

        q := models.Question{
            ID:        primitive.NewObjectID(),
            UserID:    uid,
            CourseID:  cid,
            Title:     fmt.Sprintf("Sample question #%d", i+1),
            Content:   fmt.Sprintf("What is the expected behavior for sample question %d? This content is generated.", i+1),
            Type:      "question",
            CreatedAt: time.Now(),
            Likes:     []primitive.ObjectID{},
            Dislikes:  []primitive.ObjectID{},
            SavedBy:   []primitive.ObjectID{},
        }

        res, err := col.InsertOne(ctx, q)
        if err != nil {
            log.Printf("failed to insert question: %v", err)
            continue
        }
        if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
            qIDs = append(qIDs, oid)
        }
        log.Printf("inserted question: %s", q.Title)
    }

    return qIDs
}

func createComments(ctx context.Context, userIDs, postIDs []primitive.ObjectID) {
    if len(userIDs) == 0 || len(postIDs) == 0 {
        log.Println("no posts or users to create comments")
        return
    }

    col := config.DB.Collection("comments")

    for i := 0; i < 20; i++ {
        author := userIDs[rand.Intn(len(userIDs))]
        post := postIDs[rand.Intn(len(postIDs))]

        c := models.Comment{
            ID:        primitive.NewObjectID(),
            Content:   fmt.Sprintf("Sample comment #%d for testing.", i+1),
            PostID:    post,
            AuthorID:  author,
            Author:    models.User{ID: author, Email: fmt.Sprintf("commenter%d@example.edu", i+1)},
            Upvotes:   rand.Intn(20),
            Downvotes: rand.Intn(5),
            Score:     0,
            IsDeleted: false,
            CreatedAt: time.Now(),
            UpdatedAt: time.Now(),
        }
        c.Score = c.Upvotes - c.Downvotes

        _, err := col.InsertOne(ctx, c)
        if err != nil {
            log.Printf("failed to insert comment: %v", err)
            continue
        }
    }
}
