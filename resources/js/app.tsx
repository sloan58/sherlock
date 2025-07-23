import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from './components/ui/sonner';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize Laravel Echo for WebSocket support
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
    
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authorizer: (channel: any, options: any) => {
            return {
                authorize: (socketId: string, callback: Function) => {
                    fetch('/terminal/authorize', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({
                            channel_name: channel.name,
                            socket_id: socketId,
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        callback(null, data);
                    })
                    .catch(error => {
                        callback(error);
                    });
                }
            };
        }
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
