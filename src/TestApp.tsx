import React, { useState, useEffect } from 'react';
import { SimpleAppProvider } from './contexts/SimpleAppContext';

function TestComponent() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('React hooks test starting...');

  useEffect(() => {
    setMessage('✅ React hooks are working correctly!');
    console.log('React hooks test successful');
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        Kaha Hostel Control Center
      </h1>
      <h2 style={{ color: '#059669', marginBottom: '30px' }}>
        {message}
      </h2>
      
      <div style={{ 
        background: '#f8fafc', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '15px' }}>
          Counter Test: <strong>{count}</strong>
        </p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Increment Counter
        </button>
      </div>

      <div style={{ 
        background: '#ecfdf5', 
        border: '1px solid #10b981',
        padding: '15px', 
        borderRadius: '8px',
        color: '#065f46'
      }}>
        <p><strong>React Environment Status:</strong></p>
        <p>✅ useState hook: Working</p>
        <p>✅ useEffect hook: Working</p>
        <p>✅ Component rendering: Working</p>
        <p>✅ Event handlers: Working</p>
      </div>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
        If you can see this and the counter works, React hooks are functioning properly.
        <br />
        You can now safely use the full application.
      </div>
    </div>
  );
}

function TestApp() {
  return (
    <SimpleAppProvider>
      <TestComponent />
    </SimpleAppProvider>
  );
}

export default TestApp;