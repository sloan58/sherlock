import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, X, Terminal } from 'lucide-react';
import { route } from 'ziggy-js';

interface TerminalProps {
    networkSwitchId: number;
    networkSwitchHost: string;
}

declare global {
    interface Window {
        Echo: any;
        Pusher: any;
    }
}

export default function TerminalComponent({ networkSwitchId, networkSwitchHost }: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstanceRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const echoRef = useRef<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize terminal
        const terminal = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            theme: {
                background: '#0f0f0f',
                foreground: '#ffffff',
                cursor: '#ffffff',
                black: '#000000',
                red: '#e06c75',
                green: '#98c379',
                yellow: '#d19a66',
                blue: '#61afef',
                magenta: '#c678dd',
                cyan: '#56b6c2',
                white: '#ffffff',
                brightBlack: '#5c6370',
                brightRed: '#e06c75',
                brightGreen: '#98c379',
                brightYellow: '#d19a66',
                brightBlue: '#61afef',
                brightMagenta: '#c678dd',
                brightCyan: '#56b6c2',
                brightWhite: '#ffffff',
            },
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        terminalInstanceRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Handle terminal input
        terminal.onData((data) => {
            // Send command to server
            sendCommand(data);
        });

        // Initialize Echo for WebSocket communication
        initializeEcho();

        // Test connection on mount
        testConnection();

        return () => {
            terminal.dispose();
            if (echoRef.current) {
                echoRef.current.disconnect();
            }
        };
    }, [networkSwitchId]);

    const initializeEcho = () => {
        if (typeof window !== 'undefined' && window.Echo) {
            echoRef.current = window.Echo;
            
            // Listen for terminal output
            echoRef.current.private(`terminal.${networkSwitchId}`)
                .listen('TerminalOutput', (e: any) => {
                    if (terminalInstanceRef.current) {
                        const { output, type } = e;
                        
                        if (type === 'command') {
                            // Don't echo back the command, it's already in the terminal
                            return;
                        }
                        
                        terminalInstanceRef.current.write(output);
                    }
                });
        }
    };

    const testConnection = async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');

        try {
            const response = await fetch(route('terminal.test', networkSwitchId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();

            if (result.success) {
                setIsConnected(true);
                setConnectionStatus('connected');
                if (terminalInstanceRef.current) {
                    terminalInstanceRef.current.write('\r\n\x1b[32m✓ Connected to ' + networkSwitchHost + '\x1b[0m\r\n');
                    terminalInstanceRef.current.write('\x1b[36m$ \x1b[0m');
                }
            } else {
                setIsConnected(false);
                setConnectionStatus('error');
                if (terminalInstanceRef.current) {
                    terminalInstanceRef.current.write('\r\n\x1b[31m✗ Connection failed: ' + result.message + '\x1b[0m\r\n');
                }
            }
        } catch (error) {
            setIsConnected(false);
            setConnectionStatus('error');
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.write('\r\n\x1b[31m✗ Connection error: ' + error + '\x1b[0m\r\n');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const sendCommand = async (command: string) => {
        if (!isConnected) return;

        try {
            const response = await fetch(route('terminal.execute', networkSwitchId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ command }),
            });

            const result = await response.json();

            if (!result.success) {
                if (terminalInstanceRef.current) {
                    terminalInstanceRef.current.write('\r\n\x1b[31mError: ' + result.error + '\x1b[0m\r\n');
                }
            }
        } catch (error) {
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.write('\r\n\x1b[31mError sending command: ' + error + '\x1b[0m\r\n');
            }
        }
    };

    const closeConnection = async () => {
        try {
            await fetch(route('terminal.close', networkSwitchId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setIsConnected(false);
            setConnectionStatus('disconnected');
            
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.write('\r\n\x1b[33mConnection closed\x1b[0m\r\n');
            }
        } catch (error) {
            console.error('Error closing connection:', error);
        }
    };

    const getStatusBadge = () => {
        switch (connectionStatus) {
            case 'connected':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Connected</Badge>;
            case 'connecting':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Connecting...</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Error</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Disconnected</Badge>;
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <Wifi className="h-4 w-4 text-green-500" />;
            case 'connecting':
                return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
            case 'error':
                return <WifiOff className="h-4 w-4 text-red-500" />;
            default:
                return <WifiOff className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-mono">
                        <Terminal className="h-5 w-5" />
                        SSH Terminal
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        {getStatusBadge()}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={testConnection}
                            disabled={isConnecting}
                            className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10 hover:border-blue-600/50"
                        >
                            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                        </Button>
                        {isConnected && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={closeConnection}
                                className="border-red-600/30 text-red-600 hover:bg-red-600/10 hover:border-red-600/50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div 
                    ref={terminalRef} 
                    className="h-96 w-full bg-black rounded-lg overflow-hidden"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
            </CardContent>
        </Card>
    );
} 