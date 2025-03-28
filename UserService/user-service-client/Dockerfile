# Use a minimal Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire user-service-client folder (excluding node_modules due to .dockerignore)
COPY . .

# Install dependencies
RUN npm install

# Expose the port FrontendService runs on
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]