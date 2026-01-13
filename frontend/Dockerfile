FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Run application
CMD ["node", ".output/server/index.mjs"]
