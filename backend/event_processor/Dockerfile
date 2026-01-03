# Build stage
FROM public.ecr.aws/docker/library/node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

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

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3005

# Start the application
CMD ["node", "dist/main"]
