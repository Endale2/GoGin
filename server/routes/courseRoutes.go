package routes

import (
	"github.com/gin-gonic/gin"
	"go-gin/controllers"
)

func CourseRoutes(r *gin.Engine) {
	courseRoutes := r.Group("/courses")
	{
		courseRoutes.GET("/", controllers.GetCourses)
		courseRoutes.GET("/:id", controllers.GetCourseByID)
		courseRoutes.POST("/", controllers.CreateCourse)
		courseRoutes.PUT("/:id", controllers.UpdateCourse)
		courseRoutes.DELETE("/:id", controllers.DeleteCourse)
	}
}
