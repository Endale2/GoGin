package main

import (
	"context"
	"go-gin/config"
	"go-gin/models"
	"go-gin/utils"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	// Connect to database
	config.ConnectDB()

	// Populate universities
	populateUniversities()
	
	// Populate departments
	populateDepartments()
	
	// Populate courses
	populateCourses()

	log.Println("Database populated successfully!")
}

func populateUniversities() {
	collection := config.DB.Collection("universities")
	
	// Clear existing data
	collection.DeleteMany(context.Background(), map[string]interface{}{})
	
	for _, uniData := range utils.EthiopianUniversities {
		university := models.University{
			ID:          primitive.NewObjectID(),
			Name:        uniData["name"].(string),
			Location:    uniData["location"].(string),
			Website:     uniData["website"].(string),
			Established: uniData["established"].(int),
		}
		
		// Convert departments to string slice
		if deps, ok := uniData["departments"].([]string); ok {
			university.Departments = deps
		}
		
		_, err := collection.InsertOne(context.Background(), university)
		if err != nil {
			log.Printf("Error inserting university %s: %v", university.Name, err)
		} else {
			log.Printf("Inserted university: %s", university.Name)
		}
	}
}

func populateDepartments() {
	collection := config.DB.Collection("departments")
	
	// Clear existing data
	collection.DeleteMany(context.Background(), map[string]interface{}{})
	
	// Get unique departments from all universities
	departments := make(map[string]bool)
	for _, uniData := range utils.EthiopianUniversities {
		if deps, ok := uniData["departments"].([]string); ok {
			for _, dept := range deps {
				departments[dept] = true
			}
		}
	}
	
	// Insert departments
	for deptName := range departments {
		department := models.Department{
			ID:   primitive.NewObjectID(),
			Name: deptName,
		}
		
		_, err := collection.InsertOne(context.Background(), department)
		if err != nil {
			log.Printf("Error inserting department %s: %v", deptName, err)
		} else {
			log.Printf("Inserted department: %s", deptName)
		}
	}
}

func populateCourses() {
	collection := config.DB.Collection("courses")
	
	// Clear existing data
	collection.DeleteMany(context.Background(), map[string]interface{}{})
	
	for _, courseData := range utils.SampleCourses {
		course := models.Course{
			ID:    primitive.NewObjectID(),
			Title: courseData["title"].(string),
		}
		
		_, err := collection.InsertOne(context.Background(), course)
		if err != nil {
			log.Printf("Error inserting course %s: %v", course.Title, err)
		} else {
			log.Printf("Inserted course: %s", course.Title)
		}
	}
} 