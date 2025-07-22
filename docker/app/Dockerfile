FROM composer:2 AS backend_build

WORKDIR /app

# Copy composer files first
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --ignore-platform-reqs

FROM node:20 AS frontend_build

WORKDIR /app

# Copy only package files first for caching
COPY package.json package-lock.json ./
RUN npm install

# Copy only the frontend-related files
COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts ./
COPY tsconfig.json ./

# Need to copy backend deps in so ziggy install doesn't fail
COPY --from=backend_build /app/vendor vendor

# Build for production
ENV NODE_ENV=production
RUN npm run build

FROM php:8.4-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl libpng-dev libjpeg-dev libonig-dev libxml2-dev libbrotli-dev supervisor netcat-traditional cron libldap2-dev sudo \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd ldap

# Install Swoole
RUN pecl install swoole \
    && docker-php-ext-enable swoole

# Set working directory
WORKDIR /var/www

# Copy app source
COPY . .

# Copy php dependencies from backend build stage
COPY --from=backend_build /app/vendor vendor

# Copy built frontend assets from the frontend build stage
COPY --from=frontend_build /app/public/build /var/www/public/build

# Set Laravel permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Expose Octane port
EXPOSE 8000

# Copy supervisord config
COPY docker/app/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install cron and add Laravel scheduler cron job
RUN apt-get install -y cron
RUN echo "* * * * * cd /var/www && sudo -u www-data /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1" | crontab -

# Start cron in the entrypoint
COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
