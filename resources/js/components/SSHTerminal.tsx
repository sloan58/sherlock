import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, X, Terminal } from 'lucide-react';

interface SSHTerminalProps {
    networkSwitchId: number;
    networkSwitchHost: string;
    networkSwitchUsername: string;
    networkSwitchPassword: string;
    networkSwitchPort?: number;
}

export default function SSHTerminalComponent({ 
    networkSwitchId, 
    networkSwitchHost, 
    networkSwitchUsername, 
    networkSwitchPassword, 
    networkSwitchPort = 22 
}: SSHTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstanceRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize terminal with proper scrollback
        const terminal = new XTerm({
            fontSize: 14,
            fontFamily: 'monospace',
            scrollback: 1000, // ENABLE SCROLLBACK BUFFER
            rows: 20,
            cols: 80,
            theme: {
                background: '#000000',
                foreground: '#ffffff',
            },
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        terminalInstanceRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Handle terminal input
        terminal.onData((data) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'data',
                    data: data
                }));
            }
        });

        // Handle terminal resize
        terminal.onResize(({ cols, rows }) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'resize',
                    cols,
                    rows
                }));
            }
        });

        // Show welcome message
        terminal.writeln('Welcome to SSH Terminal');
        terminal.writeln('Click "Connect" to establish SSH connection to ' + networkSwitchHost);

        return () => {
            terminal.dispose();
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [networkSwitchHost]);

    const connectSSH = async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');

        try {
            // Connect to WebSocket proxy
            const ws = new WebSocket(`ws://localhost:8080`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                
                // Send connection request
                ws.send(JSON.stringify({
                    type: 'connect',
                    host: networkSwitchHost,
                    port: networkSwitchPort,
                    username: networkSwitchUsername,
                    password: networkSwitchPassword
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data.type, data);
                
                switch (data.type) {
                    case 'connected':
                        console.log('SSH connected');
                        setIsConnected(true);
                        setConnectionStatus('connected');
                        if (terminalInstanceRef.current) {
                            terminalInstanceRef.current.writeln('\x1b[32m✓ Connected to ' + networkSwitchHost + '\x1b[0m');
                        }
                        break;
                        
                    case 'data':
                        console.log('SSH data received:', data.data);
                        if (terminalInstanceRef.current) {
                            terminalInstanceRef.current.write(data.data);
                        }
                        break;
                        
                    case 'error':
                        console.log('SSH error:', data.message);
                        setIsConnected(false);
                        setConnectionStatus('error');
                        if (terminalInstanceRef.current) {
                            terminalInstanceRef.current.writeln('\x1b[31m✗ Connection error: ' + data.message + '\x1b[0m');
                            terminalInstanceRef.current.write('\x1b[36m$ \x1b[0m');
                        }
                        break;
                        
                    case 'disconnected':
                        console.log('SSH disconnected');
                        setIsConnected(false);
                        setConnectionStatus('disconnected');
                        if (terminalInstanceRef.current) {
                            terminalInstanceRef.current.writeln('\x1b[33mConnection closed\x1b[0m');
                            terminalInstanceRef.current.write('\x1b[36m$ \x1b[0m');
                        }
                        break;
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
                setConnectionStatus('error');
                if (terminalInstanceRef.current) {
                    terminalInstanceRef.current.writeln('\x1b[31m✗ WebSocket connection error\x1b[0m');
                    terminalInstanceRef.current.write('\x1b[36m$ \x1b[0m');
                }
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setIsConnected(false);
                setConnectionStatus('disconnected');
            };

        } catch (error: any) {
            setIsConnected(false);
            setConnectionStatus('error');
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.writeln('\x1b[31m✗ Connection error: ' + error.message + '\x1b[0m');
                terminalInstanceRef.current.write('\x1b[36m$ \x1b[0m');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectSSH = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        setIsConnected(false);
        setConnectionStatus('disconnected');
    };

    const getStatusBadge = () => {
        switch (connectionStatus) {
            case 'connected':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Connected</Badge>;
            case 'connecting':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Connecting...</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Connection Failed</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Ready to Connect</Badge>;
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
                        SSH Terminal (react-xtermjs)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        {getStatusBadge()}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={isConnected ? disconnectSSH : connectSSH}
                            disabled={isConnecting}
                            className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10 hover:border-blue-600/50"
                        >
                            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : isConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                        {isConnected && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={disconnectSSH}
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
                    className="h-96 w-full bg-black rounded-lg"
                    style={{ 
                        height: '384px',
                        overflow: 'hidden'
                    }}
                />
            </CardContent>
        </Card>
    );
} 