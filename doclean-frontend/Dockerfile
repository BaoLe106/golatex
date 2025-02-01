# Dockerfile for React Frontend
FROM node:22-alpine AS build

# Set up the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 3006

# Define the command to run your app
CMD ["npm", "run", "dev"]