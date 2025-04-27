package redisProvider

import (
	"context"

	"github.com/BaoLe106/doclean/doclean-backend/utils/logger"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedisClient() {
	ctx := context.Background()

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "redis-13336.c1.us-west-2-2.ec2.redns.redis-cloud.com:13336",
		Username: "default",
		Password: "V7zaKlth6aw37KsyVJNzAbH8FgxqjDnL",
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