# Multi-stage build for Order Service
FROM public.ecr.aws/docker/library/node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with retry config for npm registry issues
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps

# Copy source code
COPY src ./src
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Build the application
RUN npx nest build

# Production stage
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "dist/main"]
