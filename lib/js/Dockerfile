FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY ssh-proxy.js ./

# Expose WebSocket port
EXPOSE 8080

# Start the WebSocket server
CMD ["node", "ssh-proxy.js"] 