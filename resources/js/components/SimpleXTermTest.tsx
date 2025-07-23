import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// Hardcoded switch connection details for testing
const SWITCH_HOST = '10.134.17.26';
const SWITCH_PORT = 22;
const SWITCH_USERNAME = 'idceng';
const SWITCH_PASSWORD = '1dc3ng';

export default function SimpleXTermTest() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
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
    term.write('\x1b[2J'); // Clear screen
    term.write('\x1b[H'); // Move cursor to home
    term.writeln('Connecting to SSH switch...');

    // Connect to WebSocket SSH proxy
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'connect',
        host: SWITCH_HOST,
        port: SWITCH_PORT,
        username: SWITCH_USERNAME,
        password: SWITCH_PASSWORD,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'connected':
          term.writeln('\x1b[32m✓ Connected to switch\x1b[0m');
          break;
        case 'data':
          term.write(data.data);
          break;
        case 'error':
          term.writeln(`\x1b[31m✗ Error: ${data.message}\x1b[0m`);
          break;
        case 'disconnected':
          term.writeln('\x1b[33mConnection closed\x1b[0m');
          break;
      }
    };

    ws.onerror = (err) => {
      term.writeln('\x1b[31m✗ WebSocket error\x1b[0m');
    };
    ws.onclose = () => {
      term.writeln('\x1b[33mWebSocket closed\x1b[0m');
    };

    // Send terminal input to SSH
    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'data', data }));
      }
    });

    // Clean up
    return () => {
      term.dispose();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: 400, background: '#000', borderRadius: 8 }}>
      <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
} 