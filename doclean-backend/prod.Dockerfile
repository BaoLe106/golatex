# Stage 1: Build TeX Live minimal distribution
FROM registry.gitlab.com/islandoftex/images/texlive:latest AS texlive-builder

# Install only the necessary TeX packages
RUN tlmgr install \
    collection-basic \
    collection-latex \
    collection-latexrecommended \
    collection-fontsrecommended \
    latexmk \
    && tlmgr path add

RUN pdflatex --version

# Stage 2: Build Go application
FROM golang:1.24.2-alpine AS go-builder

WORKDIR /app

# Copy and download dependencies first for better caching
COPY .env.prod go.mod go.sum ./

RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application (assuming main.go is in the root)
RUN CGO_ENABLED=0 go build -o /app/bin/server ./main.go

# Stage 3: Final minimal image
FROM alpine:3.19

# Install minimal dependencies
RUN apk add --no-cache \
    perl \
    wget \
    fontconfig \
    freetype \
    libpng \
    libjpeg-turbo \
    libstdc++

# Copy TeX Live from builder
COPY --from=texlive-builder /usr/local/texlive/ /usr/local/texlive
ENV PATH="/usr/local/texlive/2025/bin/x86_64-linux:/usr/local/bin:$PATH"

RUN pdflatex --version

# Copy compiled Go binary
COPY --from=go-builder /app/bin/server /usr/local/bin/server

# Copy any necessary static files (templates, assets, etc.)
# COPY --from=go-builder /app/static /app/static

# Set up working directory and runtime user
WORKDIR /app
RUN adduser -D appuser
USER appuser

EXPOSE 8080
CMD ["server"]