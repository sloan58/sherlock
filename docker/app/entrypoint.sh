#!/bin/sh
set -e

# Load Laravel-style .env file into shell environment
# Wait for .env to be mounted
ENV_PATH="/var/www/.env"
echo "Waiting for $ENV_PATH to be available..."

while [ ! -f "$ENV_PATH" ]; do
    sleep 0.5
done

# Load env vars from mounted .env
set -a
. "$ENV_PATH"
set +a

# Laravel production bootstrapping
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Wait for MySQL to start completely
echo "Waiting for database DNS resolution for $DB_HOST..."
until getent hosts "$DB_HOST" > /dev/null; do
    echo "DNS not ready for $DB_HOST. Waiting..."
    sleep 2
done

echo "DNS resolved. Waiting for $DB_HOST:$DB_PORT to be accessible..."
until nc -z "$DB_HOST" "$DB_PORT"; do
    echo "Database not accepting connections yet. Waiting..."
    sleep 2
done
#
## Run migrations
#php artisan migrate --force
php artisan db:seed --class=RoleSeeder --force
php artisan db:seed --class=AdminUserSeeder --force

# Add the PRD Sites
php artisan sites:import

# Start cron
service cron start

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
