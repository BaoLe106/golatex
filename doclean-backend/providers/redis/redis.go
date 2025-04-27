package redisProvider

import (
	"context"

	"github.com/BaoLe106/doclean/doclean-backend/configs"
	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedisClient() {
	ctx := context.Background()

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     configs.Envs.RedisAddr,
		Username: configs.Envs.RedisUsername,
		Password: configs.Envs.RedisPassword,
		DB:       0,
	})
	
	// rdb.Set(ctx, "foo", "bar", 0)

	// defer RedisClient.Close()

	statusMsg, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		logger.BasicLogHandler(logger.BasicLogInput{
			Status: false,
			Message: err.Error(),
		})
		return;
	}

	logger.BasicLogHandler(logger.BasicLogInput{
		Status: true,
		Message: statusMsg,
	})
}