import React from 'react';
import { SafeAppProvider } from './contexts/SafeAppContext';
import TestSafeContext from './pages/TestSafeContext';

function MinimalApp() {
  return (
    <SafeAppProvider>
      <TestSafeContext />
    </SafeAppProvider>
  );
}

export default MinimalApp;