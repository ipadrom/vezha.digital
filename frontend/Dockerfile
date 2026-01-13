FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for production
ARG NUXT_PUBLIC_API_URL
ARG NUXT_PUBLIC_TELEGRAM_BOT_USERNAME
ARG NUXT_APP_BASE_URL

# Set as environment variables for build
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NUXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL

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
