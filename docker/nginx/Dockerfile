FROM nginx:alpine

# Copy configuration files
COPY docker/nginx/default-http.conf /etc/nginx/conf.d/default-http.conf
COPY docker/nginx/default-ssl.conf /etc/nginx/conf.d/default-ssl.conf

# Copy entrypoint script
COPY docker/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
