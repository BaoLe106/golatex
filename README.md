# Development Guide

Go to the root of the project:

```
doclean/
├── doclean-backend/
│   ├── cmd/
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   └── Dockerfile
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
└── docker-compose.yml
```

```
docker network create golatex-network
```




# Ignore everything below this line:
which mean at `doclean/`


and run the command below:
```
docker-compose up --build
```
then you are ready to go!
