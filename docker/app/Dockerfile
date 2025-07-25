FROM node:22 AS frontend

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci

COPY resources/ resources/
COPY public/ public/
COPY vite.config.ts tsconfig.json ./

RUN npm run build

FROM composer:2 AS backend

WORKDIR /app

COPY . .

RUN composer install --optimize-autoloader --no-dev

FROM dunglas/frankenphp AS app

RUN apt update && apt install -y supervisor netcat-openbsd

RUN install-php-extensions pcntl pdo_mysql redis

COPY . /app

COPY .env.production /app/.env

COPY --from=frontend /app/public/build /app/public/build

COPY --from=backend /app/vendor /app/vendor

RUN mv ./docker/app/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chmod +x ./docker/app/entrypoint.sh

CMD ["/app/docker/app/entrypoint.sh"]
