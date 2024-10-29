# Dockerfile for React Frontend
FROM node:22.9.0-alpine AS build

# Set up the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the React application
RUN npm run build

# Serve the build using a minimal web server (e.g., Nginx)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port that Nginx will use
EXPOSE 80
