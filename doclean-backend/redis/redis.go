package redis

import "github.com/redis/go-redis/v9"

func redis_connect() *redis.Client {
	// ctx := context.Background()
	// ctx := gin.Context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr:     "memcached-15171.c285.us-west-2-2.ec2.redns.redis-cloud.com:15171",
		Username: "default",
		Password: "",
		DB:       0,
	})

	return rdb

	// rdb.Set(ctx, "foo", "bar", 0)

}
