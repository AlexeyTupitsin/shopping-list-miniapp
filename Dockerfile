# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy bot files
COPY bot/package*.json ./
RUN npm ci

# Copy bot source
COPY bot/ ./

# Build TypeScript
RUN npm run build

# Start bot
CMD ["node", "dist/index.js"]
