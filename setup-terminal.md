# SSH Terminal Setup Guide

## Environment Variables

Add these to your `.env` file:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

## For Development (Local WebSocket Server)

1. Install Soketi:
```bash
npm install -g @soketi/soketi
```

2. Start Soketi:
```bash
soketi start
```

3. Update your `.env`:
```env
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=
```

## For Production (Pusher Cloud)

1. Sign up at https://pusher.com
2. Create a new app
3. Use the provided credentials in your `.env` file

## Features

- Real-time SSH terminal using xterm.js
- WebSocket communication via Laravel Echo
- Secure authentication and authorization
- Connection status indicators
- Command history and output streaming
- Professional terminal styling with JetBrains Mono font

## Usage

1. Navigate to a network switch edit page
2. Click the "Terminal" tab in the sidebar
3. Click "Test" to establish SSH connection
4. Type commands in the terminal
5. See real-time output from the remote device

## Security

- All SSH connections are proxied through the Laravel backend
- Private channels ensure only authorized users can access terminals
- CSRF protection on all terminal endpoints
- Connection authentication via Laravel's auth system 