import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MinimalApp from './MinimalApp.tsx'
import './index.css'

console.log('🚀 Starting minimal React app...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <MinimalApp />
  </StrictMode>
);

console.log('✅ Minimal React app rendered');