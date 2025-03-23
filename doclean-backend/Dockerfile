# Dockerfile for Go Backend
FROM golang:1.23.2-alpine

# RUN apt update && apt install --no-install-recommends -y wget perl-tk && \
#     apt clean && rm -rf /var/lib/apt/lists/*

RUN apk update && apk add --no-cache wget perl-tk bash

# Install TeX Live full.
RUN wget -qO- https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz | tar -xzvf - && \
    mv install-tl-* install-tl && cd install-tl && \
    echo "selected_scheme scheme-full" > profile && \
    echo "tlpdbopt_install_docfiles 0" >> profile && \
    echo "tlpdbopt_install_srcfiles 0" >> profile && \
    ./install-tl -repository https://mirror.ctan.org/systems/texlive/tlnet -profile profile && \
    cd .. && rm -rf install-tl

# Make TeX Live tools available on path.
ENV PATH="${PATH}:/usr/local/texlive/2024/bin/x86_64-linuxmusl"

# Ensure TeX Live format files are properly configured
# RUN texconfig rehash

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
# RUN pdflatex --version
# Run the Go app
CMD ["air", "-c", ".air.toml"]