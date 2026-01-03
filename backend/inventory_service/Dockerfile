# Build stage
FROM public.ecr.aws/docker/library/node:20-slim AS build

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

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3004

# Start the application
CMD ["node", "dist/main"]
