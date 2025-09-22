import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TestApp from './TestApp.tsx'
import './index.css'

console.log('🚀 Starting React test...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);

console.log('✅ React test app rendered');