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

# Laravel production bootstrapping
php artisan optimize

## Run migrations
php artisan migrate --force

# Start cron
service cron start

# Generate supervisord config
cp /etc/supervisord-base/base.conf /etc/supervisord.conf
cat /etc/supervisord-base/web.conf >> /etc/supervisord.conf
cat /etc/supervisord-base/queue.conf >> /etc/supervisord.conf

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
