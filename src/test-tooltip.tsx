import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

// Test component to isolate TooltipProvider issues
export const TestTooltip: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="p-4">
        <h3>TooltipProvider Test</h3>
        <p>If you can see this, TooltipProvider is working correctly.</p>
      </div>
    </TooltipProvider>
  );
};