package controllers

import (
	"go-gin/services"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	UserService services.UserService
}

func New(userService services.UserService) *UserController {
	return &UserController{
		UserService: userService,
	}
}

func (uc *UserController) CreateUser(ctx *gin.Context) {
	ctx.JSON(200, "success")
}

func (uc *UserController) GetUser(ctx *gin.Context) {
	ctx.JSON(200, "success")
}
func (uc *UserController) GetAllUser(ctx *gin.Context) {
	ctx.JSON(200, "success")
}

func (uc *UserController) UpdateUser(ctx *gin.Context) {
	ctx.JSON(200, "success")
}

func (uc *UserController) DeleteUser(ctx *gin.Context) {
	ctx.JSON(200, "success")
}

func (uc *UserController) RegisterRoutesGroup(rg *gin.RouterGroup) {
	userroute := rg.Group("/user")
	userroute.POST("/create", uc.CreateUser)
	userroute.GET("/:name", uc.GetUser)
	userroute.GET("/all_users", uc.GetAllUser)
	userroute.PATCH("/update", uc.UpdateUser)
	userroute.DELETE("/delete", uc.DeleteUser)

}
