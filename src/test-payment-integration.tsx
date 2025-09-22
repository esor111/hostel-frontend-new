import React from 'react';
import { PaymentRecording } from './components/ledger/PaymentRecording';
import { SafeTooltipProvider } from './components/providers/SafeTooltipProvider';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

/**
 * Test component to verify PaymentRecording integration
 * This component tests the real API integration with the payment system
 */
export const TestPaymentIntegration: React.FC = () => {
  return (
    <BrowserRouter>
      <SafeTooltipProvider>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Payment Recording Integration Test
              </h1>
              <p className="text-gray-600">
                Testing the integrated PaymentRecording component with real API services
              </p>
            </div>
            
            <PaymentRecording />
          </div>
        </div>
        <Toaster />
      </SafeTooltipProvider>
    </BrowserRouter>
  );
};

export default TestPaymentIntegration;