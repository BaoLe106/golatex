# Stage 1: Build stage for TeX Live
FROM registry.gitlab.com/islandoftex/images/texlive:latest AS texlive-stage
RUN pdflatex --version

# Stage 2: Build Go application
FROM golang:1.25.1-bookworm
# Copy TeX Live from the first stage
COPY --from=texlive-stage /usr/local/texlive/ /usr/local/texlive
# Make TeX Live tools available on path.
ENV PATH="/usr/local/texlive/2025/bin/x86_64-linux:$PATH"
# RUN which pdflatex
RUN pdflatex --version
# Set up the working directory inside the container
WORKDIR /app
# Copy and download dependencies first for better caching
COPY .env go.mod go.sum ./

RUN go mod download
# Copy the rest of the source code
COPY . .

# Build the application (assuming main.go is in the root)
RUN CGO_ENABLED=0 go build -o main ./main.go
RUN chmod +x main
EXPOSE 8080

# Default command to run the app
CMD ["./main"]