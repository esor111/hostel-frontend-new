import React, { ReactNode } from 'react';

// Safe tooltip provider that doesn't break the app
// We'll add TooltipProvider back later when the React hooks issue is resolved
export const SafeTooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // For now, just return children without TooltipProvider
  // This prevents the React hooks error while maintaining functionality
  return <>{children}</>;
};

// TODO: Once React hooks issue is resolved, replace with:
// import { TooltipProvider } from '@/components/ui/tooltip';
// export const SafeTooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   return <TooltipProvider>{children}</TooltipProvider>;
// };