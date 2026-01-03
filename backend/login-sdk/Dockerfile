# Multi-stage build for production
FROM public.ecr.aws/docker/library/node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Configure npm for better reliability and install dependencies
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copy source code
COPY src ./src

# Build the application
RUN npx nest build

# Production stage
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies with retries
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm ci --omit=dev --prefer-offline --no-audit --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/main"]
