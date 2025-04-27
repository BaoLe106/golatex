package redisProvider

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func SetCache(ctx *gin.Context, key string, value string, ttl time.Duration) *error {
	fmt.Println("#debug set cache", key, value, ttl);
	err := RedisClient.Set(ctx, key, value, ttl).Err()
	if err != nil {
		return &err
	}
 	return nil
}

func GetCache(ctx *gin.Context, key string) (any, *error ) {
	val, err := RedisClient.Get(ctx, key).Result()
	if err != nil {
		return nil, &err
	}

	return val, nil
}

func InvalidateCache(ctx *gin.Context, key string) *error {
	err := RedisClient.Del(ctx, key).Err()
	if err != nil {
		return &err
	}

 	return nil
}