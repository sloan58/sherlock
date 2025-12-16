/**
 * Get the WebSocket URL based on the current environment
 * Uses WSS in production (HTTPS) and WS in development (HTTP)
 */
export function getWebSocketUrl(path: string = ''): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WEBSOCKET_HOST || window.location.hostname;
    const port = import.meta.env.VITE_WEBSOCKET_PORT || (protocol === 'wss:' ? '' : ':8080');
    
    // In production with Caddy, use the same hostname and path
    if (protocol === 'wss:') {
        return `${protocol}//${host}${path || '/ws'}`;
    }
    
    // In development, connect directly to localhost:8080
    return `${protocol}//${host}${port}${path}`;
}

