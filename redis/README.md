`docker run -d --name redis-server-container -p 6379:6379 redis/redis-stack-server:latest`

`docker exec -it redis-server-container redis-cli`
