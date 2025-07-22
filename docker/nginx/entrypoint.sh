#!/bin/sh

# Check if SSL certificates are mounted
if [ -f "/etc/nginx/ssl/cert.pem" ] && [ -f "/etc/nginx/ssl/key.pem" ]; then
    echo "SSL certificates found, using SSL configuration"
    cp /etc/nginx/conf.d/default-ssl.conf /etc/nginx/conf.d/default.conf
    # Remove the HTTP config to avoid conflicts
    rm -f /etc/nginx/conf.d/default-http.conf
else
    echo "No SSL certificates found, using HTTP configuration"
    cp /etc/nginx/conf.d/default-http.conf /etc/nginx/conf.d/default.conf
    # Remove the SSL config to avoid conflicts
    rm -f /etc/nginx/conf.d/default-ssl.conf
fi

# Start nginx
exec nginx -g "daemon off;" 