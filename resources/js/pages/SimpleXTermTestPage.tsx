import React from 'react';
import SimpleXTermTest from '@/components/SimpleXTermTest';

export default function SimpleXTermTestPage() {
  return (
    <div style={{ padding: 32, background: '#18181b', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', fontFamily: 'monospace', marginBottom: 24 }}>Simple XTerm Test</h1>
      <SimpleXTermTest />
    </div>
  );
} 