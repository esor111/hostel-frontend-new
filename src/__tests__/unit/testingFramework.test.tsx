import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Simple test component to validate React Testing Library setup
const TestComponent: React.FC<{ onButtonClick?: () => void }> = ({ onButtonClick }) => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>Testing Framework Validation</h1>
      <p data-testid="count">Count: {count}</p>
      <button 
        onClick={() => {
          setCount(c => c + 1);
          onButtonClick?.();
        }}
        data-testid="increment-button"
      >
        Increment
      </button>
      <input 
        data-testid="test-input"
        placeholder="Type something..."
      />
    </div>
  );
};

describe('Testing Framework Validation', () => {
  describe('React Testing Library Setup', () => {
    it('should render components correctly', () => {
      render(<TestComponent />);
      
      expect(screen.getByText('Testing Framework Validation')).toBeInTheDocument();
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
      expect(screen.getByTestId('increment-button')).toBeInTheDocument();
    });

    it('should handle user interactions', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const button = screen.getByTestId('increment-button');
      const countDisplay = screen.getByTestId('count');
      
      expect(countDisplay).toHaveTextContent('Count: 0');
      
      await user.click(button);
      expect(countDisplay).toHaveTextContent('Count: 1');
      
      await user.click(button);
      expect(countDisplay).toHaveTextContent('Count: 2');
    });

    it('should handle input events', async () => {
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const input = screen.getByTestId('test-input');
      
      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('should handle function mocking', async () => {
      const mockCallback = vi.fn();
      const user = userEvent.setup();
      
      render(<TestComponent onButtonClick={mockCallback} />);
      
      const button = screen.getByTestId('increment-button');
      
      await user.click(button);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      await user.click(button);
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('Vitest Features', () => {
    it('should support async/await', async () => {
      const asyncFunction = async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('async result'), 100);
        });
      };

      const result = await asyncFunction();
      expect(result).toBe('async result');
    });

    it('should support mocking', () => {
      const mockFn = vi.fn();
      mockFn.mockReturnValue('mocked value');
      
      expect(mockFn()).toBe('mocked value');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should support spying', () => {
      const obj = {
        method: () => 'original'
      };
      
      const spy = vi.spyOn(obj, 'method').mockReturnValue('spied');
      
      expect(obj.method()).toBe('spied');
      expect(spy).toHaveBeenCalledTimes(1);
      
      spy.mockRestore();
      expect(obj.method()).toBe('original');
    });
  });

  describe('MSW Integration', () => {
    it('should have MSW server running', async () => {
      // This test validates that MSW is properly set up
      // by making a request that should be intercepted
      const response = await fetch('http://localhost:3001/hostel/api/v1/health');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data).toEqual({ status: 'ok' });
    });

    it('should mock API responses', async () => {
      const response = await fetch('http://localhost:3001/hostel/api/v1/students');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Jest DOM Matchers', () => {
    it('should support jest-dom matchers', () => {
      render(<TestComponent />);
      
      const heading = screen.getByText('Testing Framework Validation');
      const button = screen.getByTestId('increment-button');
      const input = screen.getByTestId('test-input');
      
      expect(heading).toBeInTheDocument();
      expect(heading).toBeVisible();
      expect(button).toBeEnabled();
      expect(input).toHaveAttribute('placeholder', 'Type something...');
    });
  });
});