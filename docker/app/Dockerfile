# --- Stage 1: Build assets using Node.js ---
FROM php:8.4-cli AS frontend

WORKDIR /app

# Install Node.js, npm, unzip, and git
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs unzip git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install Composer for Ziggy
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --ignore-platform-reqs

# Copy only package files first for caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy only the frontend-related files
COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts ./
COPY tsconfig.json ./

# Build for production
ENV NODE_ENV=production
RUN pnpm run build

# --- Stage 2: Laravel + PHP + Octane (final image) ---
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

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy app source
COPY . .

# Copy built frontend assets from the frontend stage
COPY --from=frontend /app/public/build /var/www/public/build

# Install dependencies
RUN #composer install --optimize-autoloader --no-dev
RUN composer install

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
