import React, { useEffect, useRef, useState } from 'react';
import { useXTerm } from 'react-xtermjs';
import { getWebSocketUrl } from '@/lib/websocket';

export default function TerminalBareTest() {
    const { instance, ref } = useXTerm({
        options: {
            fontSize: 14,
            fontFamily: 'monospace',
            scrollback: 1000,
            rows: 20,
            cols: 80,
        }
    });
    
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Test switch credentials
    const testSwitch = {
        host: '10.134.17.26',
        username: 'idceng',
        password: '1dc3ng',
        port: 22
    };

    useEffect(() => {
        if (!instance) return;

        // Handle terminal input
        instance.onData((data) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'data',
                    data: data
                }));
            }
        });

        // Handle terminal resize
        instance.onResize(({ cols, rows }) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'resize',
                    cols,
                    rows
                }));
            }
        });

        // Show test message
        instance.writeln('Bare Terminal Test');
        instance.writeln('Click "Connect" to establish SSH connection');

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const connectSSH = async () => {
        setIsConnecting(true);

        try {
            const ws = new WebSocket(getWebSocketUrl());
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                
                ws.send(JSON.stringify({
                    type: 'connect',
                    host: testSwitch.host,
                    port: testSwitch.port,
                    username: testSwitch.username,
                    password: testSwitch.password
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data.type);
                
                switch (data.type) {
                    case 'connected':
                        console.log('SSH connected');
                        setIsConnected(true);
                        if (instance) {
                            instance.writeln('✓ Connected to ' + testSwitch.host);
                        }
                        break;
                        
                    case 'data':
                        if (instance) {
                            instance.write(data.data);
                        }
                        break;
                        
                    case 'error':
                        console.log('SSH error:', data.message);
                        setIsConnected(false);
                        if (instance) {
                            instance.writeln('✗ Connection error: ' + data.message);
                        }
                        break;
                        
                    case 'disconnected':
                        console.log('SSH disconnected');
                        setIsConnected(false);
                        if (instance) {
                            instance.writeln('Connection closed');
                        }
                        break;
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
                if (instance) {
                    instance.writeln('✗ WebSocket connection error');
                }
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setIsConnected(false);
            };

        } catch (error: any) {
            setIsConnected(false);
            if (instance) {
                instance.writeln('✗ Connection error: ' + error.message);
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
    };

    return (
        <div style={{ padding: '20px', height: '100vh' }}>
            <h1>Bare Terminal Test</h1>
            <p>This is a completely bare xterm.js instance with no layouts or complex styling.</p>
            
            <div style={{ marginBottom: '10px' }}>
                <button 
                    onClick={isConnected ? disconnectSSH : connectSSH}
                    disabled={isConnecting}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: isConnected ? '#dc2626' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
                </button>
                <span>Status: {isConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
            
            <div 
                ref={ref} 
                style={{ 
                    width: '800px',
                    height: '400px',
                    border: '1px solid #ccc',
                    backgroundColor: '#000'
                }}
            />
            
            <div style={{ marginTop: '20px' }}>
                <p>This terminal should scroll when content exceeds the height.</p>
                <p>Try running commands like "show mac address-table" to test scrolling.</p>
            </div>
        </div>
    );
} 