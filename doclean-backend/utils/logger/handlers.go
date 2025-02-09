package logger

import "log"

func ApiLogHandler(logInput ApiLogInput) {
	if logInput.StatusCode >= 200 && logInput.StatusCode < 300 {
		// \033[32m --> GREEN
		log.Printf("\033[32m%v - %v\033[0m", logInput.ApiUrl, logInput.StatusCode)
		
		// if logInput.Message != nil {
		// 	log.Printf("\033[32m%v\033[0m", logInput.Message)
		// }
	} else if logInput.StatusCode >= 300 && logInput.StatusCode < 400 {
		// \033[33m --> YELLOW
		log.Printf("\033[33m%v - %v\033[0m", logInput.ApiUrl, logInput.StatusCode)

		// if logInput.Message != nil {
		// 	log.Printf("\033[33m%v\033[0m", logInput.Message)
		// }
	} else if logInput.StatusCode >= 400 {
		// \033[31m --> RED
		log.Printf("\033[31m%v - %v\033[0m", logInput.ApiUrl, logInput.StatusCode)

		// if logInput.Message != nil {
		log.Printf("\033[31m%v\033[0m", logInput.Message)
		// }
	}
}

func BasicLogHandler(logInput BasicLogInput) {
	if logInput.Status {
		log.Printf("\033[36m%v\033[0m", logInput.Message)
	} else {
		log.Printf("\033[31m%v\033[0m", logInput.Message)
	}
}