# Frontend build
FROM node:22 AS frontend

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci

COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts tsconfig.json ./

RUN npm run build

# Backend build
FROM composer:2 AS backend

WORKDIR /app

COPY . .

RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# Main Laravel app build
FROM dunglas/frankenphp:1.10-php8.4-bookworm AS app

RUN apt update && apt install -y supervisor netcat-openbsd python3-pip python3-venv libssl-dev pkg-config

RUN install-php-extensions pcntl pdo_mysql redis ldap

COPY . /app

COPY .env.production /app/.env

COPY --from=frontend /app/public/build /app/public/build

COPY --from=backend /app/vendor /app/vendor

RUN cd lib/python && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

RUN mv ./docker/app/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chmod +x ./docker/app/entrypoint.sh

CMD ["/app/docker/app/entrypoint.sh"]
