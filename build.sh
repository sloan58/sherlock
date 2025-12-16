#!/usr/bin/env bash

# Build script for Laravel + Inertia + FrankenPHP testing

set -e

echo "🔨 Building all Docker images..."

# Function to handle errors
handle_error() {
    echo "❌ Error occurred during build process!"
    echo "Failed at: $1"
    exit 1
}

# Set error handler
trap 'handle_error "$BASH_COMMAND"' ERR

echo "📦 Building sherlock-app image..."
docker build --platform=linux/amd64 -t kcr.karmatek.io/sherlock-app:latest -f docker/app/Dockerfile .
if [ $? -ne 0 ]; then
    echo "❌ Failed to build sherlock-app image"
    exit 1
fi
echo "✅ sherlock-app image built successfully!"

echo "📦 Pushing sherlock-app image..."
docker push kcr.karmatek.io/sherlock-app:latest
if [ $? -ne 0 ]; then
    echo "❌ Failed to push sherlock-app image"
    exit 1
fi
echo "✅ sherlock-app image pushed successfully!"

echo "📦 Pushing sherlock-proxy image..."
docker push kcr.karmatek.io/sherlock-proxy:latest
if [ $? -ne 0 ]; then
    echo "❌ Failed to push sherlock-proxy image"
    exit 1
fi
echo "✅ sherlock-proxy image pushed successfully!"

echo "📦 Building sherlock-websocket image..."
docker build --platform=linux/amd64 -t kcr.karmatek.io/sherlock-websocket:latest -f docker/websockets/Dockerfile .
if [ $? -ne 0 ]; then
    echo "❌ Failed to build sherlock-websocket image"
    exit 1
fi
echo "✅ sherlock-websocket image built successfully!"

echo "📦 Pushing sherlock-websocket image..."
docker push kcr.karmatek.io/sherlock-websocket:latest
if [ $? -ne 0 ]; then
    echo "❌ Failed to push sherlock-websocket image"
    exit 1
fi
echo "✅ sherlock-websocket image pushed successfully!"

echo ""
echo "🎉 All images built and pushed successfully!"
echo ""
echo "🚀 To start the application:"
echo "  cd docker && docker-compose up -d"
echo ""
echo "🔍 To view logs:"
echo "  cd docker && docker-compose logs -f app"
echo ""
echo "🛑 To stop:"
echo "  cd docker && docker-compose down"
echo ""
echo "🧹 To clean up:"
echo "  cd docker && docker-compose down -v && docker rmi kcr.karmatek.io/sherlock-app:latest"
