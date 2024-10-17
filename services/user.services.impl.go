package services

import (
	"context"
	"go-gin/models"

	"go.mongodb.org/mongo-driver/mongo"
)

type UserServiceImpl struct {
	usercollection *mongo.Collection
	ctx            context.Context
}

func NewUserServiceImpl(userCollection *mongo.Collection, ctx context.Context) *UserServiceImpl {
	return &UserServiceImpl{
		usercollection: userCollection,
		ctx:            ctx,
	}
}

func (u *UserServiceImpl) CreateUser(user *models.User) error {
	return nil
}

func (u *UserServiceImpl) GetUser(name *string) (*models.User, error) {
	return nil, nil
}
func (u *UserServiceImpl) GetAllUser() ([]*models.User, error) {
	return nil, nil
}

func (u *UserServiceImpl) UpdateUser(*models.User) error {
	return nil
}

func (u *UserServiceImpl) DeleteUser(name *string) error {
	return nil
}
