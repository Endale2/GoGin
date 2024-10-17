package models

type Address struct {
	State string `json:"statw" bson:"user_state"`
	City  string `json:"city" bson:"user_city"`
}
type User struct {
	Name    string  `json:"name" bson:"user_name"`
	Age     int     `json:"age" bson:"user_age"`
	Address Address `json:"address" bson:"user_address"`
}
