# Dockerfile for Go Backend
FROM golang:1.23.2-alpine AS builder

# Set up the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the Go application
RUN go build -o /doclean-backend ./cmd

# Create a minimal final image
FROM alpine:latest
WORKDIR /root/

# Copy binary from builder
COPY --from=builder /doclean-backend .

# Expose the port your Go app listens on
EXPOSE 8080

# Run the Go app
CMD ["./doclean-backend"]
