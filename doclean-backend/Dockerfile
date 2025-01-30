# Dockerfile for Go Backend
FROM golang:1.23.2-alpine

# Set up the working directory inside the container
WORKDIR /app

# Install AIR for live-reloading
RUN go install github.com/air-verse/air@latest 

# Copy go.mod and go.sum files
COPY go.* ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Expose the port your Go app listens on
EXPOSE 8080

# Run the Go app
CMD ["air", "-c", ".air.toml"]