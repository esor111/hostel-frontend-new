import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with our handlers
export const server = setupServer(...handlers);

// Helper function to add additional handlers during tests
export const addHandlers = (...additionalHandlers: any[]) => {
  server.use(...additionalHandlers);
};

// Helper function to reset handlers to original state
export const resetHandlers = () => {
  server.resetHandlers(...handlers);
};