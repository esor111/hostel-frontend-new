import React, { useState, useEffect } from 'react';

// Simple test component to verify hooks are working
export const TestHooks: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hooks are working!');

  useEffect(() => {
    console.log('useEffect is working, count:', count);
  }, [count]);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">React Hooks Test</h3>
      <p>{message}</p>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Increment
      </button>
    </div>
  );
};