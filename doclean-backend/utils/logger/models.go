package logger

import "net/url"

type ApiLogInput struct {
	StatusCode	int `json:"status_code"`
	Message 		string `json:"message"`
	ApiUrl			*url.URL `json:"api_url"`
}

type BasicLogInput struct {
	Status			bool `json:"status"`
	Message 		string `json:"message"`
}