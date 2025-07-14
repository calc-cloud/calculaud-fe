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

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy runtime environment injection script
COPY env.sh /docker-entrypoint.d/env.sh

# Fix permissions for OpenShift compatibility
USER root
RUN chmod +x /docker-entrypoint.d/env.sh && \
    chown -R nginx:root /usr/share/nginx/html && \
    chmod -R g+rwX /usr/share/nginx/html && \
    chmod -R o+rX /usr/share/nginx/html

# Switch back to non-root user (OpenShift will override this)
USER nginx

# Expose port 8080 (unprivileged port)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 