# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Use unprivileged NGINX image for security
FROM nginxinc/nginx-unprivileged:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy runtime environment injection script
COPY env.sh /docker-entrypoint.d/env.sh

# Fix permissions as root user
USER root
RUN chmod +x /docker-entrypoint.d/env.sh && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch back to non-root user
USER nginx

# Expose port 8080 (unprivileged port)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 