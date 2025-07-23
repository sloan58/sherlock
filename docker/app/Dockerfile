FROM node:20 AS frontend

WORKDIR /app

# Copy only package files first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy only the frontend-related files
COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts tsconfig.json ./

RUN npm run build

FROM php:8.4-cli AS backend

# System dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl libpng-dev libjpeg-dev libonig-dev libxml2-dev libbrotli-dev supervisor netcat-traditional  \
    python3-pip python3-venv libssl-dev pkg-config \
    && pecl install redis \
    && pecl install swoole \
    && pecl install mongodb \
    && docker-php-ext-enable redis swoole mongodb \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy app source
COPY . .

# Copy built frontend assets from the frontend stage
COPY --from=frontend /app/public/build /var/www/public/build

RUN mv .env.production .env

# Install dependencies
RUN composer install --optimize-autoloader --no-dev

# Init python scripts
RUN cd lib/python && python3 -m venv venv && venv/bin/pip install -r requirements.txt

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
