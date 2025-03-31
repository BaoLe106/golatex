package redis

import "github.com/redis/go-redis/v9"

var RedisClient *redis.Client

func InitRedisClient() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "memcached-15171.c285.us-west-2-2.ec2.redns.redis-cloud.com:15171",
		Username: "default",
		Password: "",
		DB:       0,
	})
	
	// rdb.Set(ctx, "foo", "bar", 0)

}