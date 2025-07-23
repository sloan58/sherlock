#!/usr/bin/env bash

docker build --platform=linux/amd64 -t kcr.karmatek.io/sherlock-app:latest -f docker/app/Dockerfile .
docker push kcr.karmatek.io/sherlock-app:latest

docker build --platform=linux/amd64 -t kcr.karmatek.io/sherlock-proxy:latest -f docker/nginx/Dockerfile .
docker push kcr.karmatek.io/sherlock-proxy:latest

docker build --platform=linux/amd64 -t kcr.karmatek.io/sherlock-websocket:latest -f docker/websockets/Dockerfile .
docker push kcr.karmatek.io/sherlock-websocket:latest
