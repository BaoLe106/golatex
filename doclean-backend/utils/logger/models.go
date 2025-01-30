package logger

import "net/url"

type LogInput struct {
	StatusCode	int `json:"status_code"`
	Message 		string `json:"message"`
	ApiUrl			*url.URL `json:"api_url"`
}