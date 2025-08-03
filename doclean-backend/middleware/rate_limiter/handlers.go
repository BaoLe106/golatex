package rate_limiter

import (
	// "time"

	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

var (
	visitors = make(map[string]*rate.Limiter)
	mu       sync.Mutex
)

// Get or create a rate limiter for the given IP
func getVisitor(ip string, rateLimit rate.Limit, burst int) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(rateLimit, burst)
		visitors[ip] = limiter
	}
	return limiter
}

// Gin middleware for rate limiting
func RateLimitMiddleware(rateLimit rate.Limit, burst int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP() // Automatically handles X-Forwarded-For etc.
		limiter := getVisitor(ip, rateLimit, burst)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(429, gin.H{"error": "Too many requests"})
			return
		}
		c.Next()
	}
}
