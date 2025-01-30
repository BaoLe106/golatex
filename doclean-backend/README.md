## NEW INSTRUCTION

1. `docker build -t golatex-backend .`
2. `docker run -p 8080:8080 --rm -v $(pwd):/app -v /app/tmp --name golatex-backend-container golatex-backend`
