# Use a minimal Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire EventService folder (excluding node_modules due to .dockerignore)
COPY . .

# Install dependencies
RUN npm install

# Expose the port EventService runs on
EXPOSE 5001

# Start the service
CMD ["node", "index.js"]