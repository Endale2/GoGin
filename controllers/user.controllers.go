package controllers

import "go-gin/services"

type UserController struct {
	UserService services.UserService
}

func New(userService services.UserService) *UserController {
	return &UserController{
		UserService: userService,
	}
}
