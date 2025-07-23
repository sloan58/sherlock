import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SSHTerminalProps {
    networkSwitchId: number;
    networkSwitchHost: string;
    networkSwitchUsername: string;
    networkSwitchPassword: string;
    networkSwitchPort?: number;
}

export default function SSHTerminalComponent({
    networkSwitchHost,
    networkSwitchUsername,
    networkSwitchPassword,
    networkSwitchPort = 22,
}: SSHTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'ready' | 'connecting' | 'connected' | 'error'>('ready');
    const termRef = useRef<Terminal | null>(null);

    // Connect handler
    const handleConnect = () => {
        setIsConnecting(true);
        setStatus('connecting');
        if (!terminalRef.current) return;
        // Clean up any previous terminal
        if (termRef.current) {
            termRef.current.dispose();
        }
        const term = new Terminal({
            fontSize: 14,
            fontFamily: 'monospace',
            scrollback: 1000,
            theme: {
                background: '#000',
                foreground: '#fff',
            },
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        term.write('\x1b[2J');
        term.write('\x1b[H');
        term.writeln('Connecting to SSH switch...');
        termRef.current = term;

        // Connect to WebSocket SSH proxy
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'connect',
                host: networkSwitchHost,
                port: networkSwitchPort,
                username: networkSwitchUsername,
                password: networkSwitchPassword,
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'connected':
                    term.writeln('\x1b[32m✓ Connected to switch\x1b[0m');
                    setIsConnected(true);
                    setIsConnecting(false);
                    setStatus('connected');
                    break;
                case 'data':
                    term.write(data.data);
                    break;
                case 'error':
                    term.writeln(`\x1b[31m✗ Error: ${data.message}\x1b[0m`);
                    setIsConnected(false);
                    setIsConnecting(false);
                    setStatus('error');
                    break;
                case 'disconnected':
                    term.writeln('\x1b[33mConnection closed\x1b[0m');
                    setIsConnected(false);
                    setIsConnecting(false);
                    setStatus('ready');
                    break;
            }
        };

        ws.onerror = (err) => {
            term.writeln('\x1b[31m✗ WebSocket error\x1b[0m');
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('error');
        };
        ws.onclose = () => {
            term.writeln('\x1b[33mWebSocket closed\x1b[0m');
            setIsConnected(false);
            setIsConnecting(false);
            setStatus('ready');
        };

        // Send terminal input to SSH
        term.onData((data) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'data', data }));
            }
        });
    };

    // Disconnect handler
    const handleDisconnect = () => {
        if (wsRef.current) wsRef.current.close();
        setIsConnected(false);
        setIsConnecting(false);
        setStatus('ready');
        if (termRef.current) {
            termRef.current.dispose();
            termRef.current = null;
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (termRef.current) termRef.current.dispose();
        };
    }, []);

    // Status badge
    const getStatusBadge = () => {
        switch (status) {
            case 'connected':
                return <span className="bg-green-600 text-white rounded px-3 py-1 text-xs font-semibold">Connected</span>;
            case 'connecting':
                return <span className="bg-yellow-500 text-white rounded px-3 py-1 text-xs font-semibold">Connecting...</span>;
            case 'error':
                return <span className="bg-red-600 text-white rounded px-3 py-1 text-xs font-semibold">Error</span>;
            default:
                return <span className="bg-slate-500 text-white rounded px-3 py-1 text-xs font-semibold">Ready</span>;
        }
    };

    return (
        <Card className="border-0 bg-gradient-to-br from-blue-600/5 to-blue-700/5">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-mono text-base">SSH Terminal</CardTitle>
                    <div className="flex items-center gap-3">
                        {getStatusBadge()}
                        {isConnected ? (
                            <button onClick={handleDisconnect} className="px-4 py-2 rounded bg-red-600 text-white font-semibold text-sm">Disconnect</button>
                        ) : (
                            <button onClick={handleConnect} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm" disabled={isConnecting}>Connect</button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 400, background: '#000', borderRadius: 8 }}>
                    <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </CardContent>
        </Card>
    );
} 