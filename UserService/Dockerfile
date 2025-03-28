# Use a minimal Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire UserService folder (excluding node_modules due to .dockerignore)
COPY . .

# Install dependencies
RUN npm install

# Expose the port UserService runs on
EXPOSE 5000

# Start the service
CMD ["node", "index.js"]