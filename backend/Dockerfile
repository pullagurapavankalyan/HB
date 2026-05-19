FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
