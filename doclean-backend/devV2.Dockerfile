# Stage 1: Build stage for TeX Live
FROM registry.gitlab.com/islandoftex/images/texlive:latest AS texlive-stage

# Install necessary packages for TeX Live
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Go Backend
FROM golang:1.24.2-bookworm

# Copy TeX Live from the first stage
COPY --from=texlive-stage /usr/local/texlive/ /usr/local/texlive

# Make TeX Live tools available on path.
ENV PATH="/usr/local/texlive/2025/bin/x86_64-linux:$PATH"

# RUN which pdflatex
RUN pdflatex --version
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