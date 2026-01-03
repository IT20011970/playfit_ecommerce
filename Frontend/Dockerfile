# Multi-stage build for production
FROM public.ecr.aws/docker/library/node:20-bookworm AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_NOTIFICATION_URL
ENV VITE_NOTIFICATION_URL=$VITE_NOTIFICATION_URL

# Copy package files and config
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install dependencies (regenerate lockfile for Linux so Rollup optional deps match)
RUN rm -f package-lock.json && npm i --include=optional

# Copy all source files
COPY components ./components
COPY context ./context
COPY graphql ./graphql
COPY hooks ./hooks
COPY pages ./pages
COPY utils ./utils
COPY index.tsx ./
COPY App.tsx ./
COPY types.ts ./
COPY constants.ts ./

# Build the application
RUN npm run build -- --mode production

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy built files to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
