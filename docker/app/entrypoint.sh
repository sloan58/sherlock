#!/bin/sh

# Run migrations
php artisan migrate --force

# Seed the database
php artisan db:seed --class=UserSeeder --force

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
