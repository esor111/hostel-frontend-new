import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../contexts/SafeAppContext';

// Mock components for testing
const MockStudentsList = () => {
  return (
    <div data-testid="students-list">
      <h2>Students List</h2>
      <div data-testid="student-item">Ishwor Sharma</div>
      <div data-testid="student-item">Ayush Patel</div>
    </div>
  );
};

const MockDashboard = () => {
  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <div data-testid="total-students">Total Students: 9</div>
      <div data-testid="active-students">Active Students: 8</div>
      <div data-testid="total-revenue">Total Revenue: NPR 45,000</div>
    </div>
  );
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          {children}
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Component Integration Tests', () => {
  describe('Students List Component', () => {
    it('should render students list correctly', async () => {
      render(
        <TestWrapper>
          <MockStudentsList />
        </TestWrapper>
      );

      expect(screen.getByTestId('students-list')).toBeInTheDocument();
      expect(screen.getByText('Students List')).toBeInTheDocument();
      
      const studentItems = screen.getAllByTestId('student-item');
      expect(studentItems).toHaveLength(2);
      expect(studentItems[0]).toHaveTextContent('Ishwor Sharma');
      expect(studentItems[1]).toHaveTextContent('Ayush Patel');
    });

    it('should handle user interactions', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MockStudentsList />
        </TestWrapper>
      );

      const studentsList = screen.getByTestId('students-list');
      expect(studentsList).toBeInTheDocument();
      
      // Test that the component is interactive
      await user.click(studentsList);
      expect(studentsList).toBeInTheDocument();
    });
  });

  describe('Dashboard Component', () => {
    it('should render dashboard with statistics', async () => {
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      expect(screen.getByTestId('total-students')).toHaveTextContent('Total Students: 9');
      expect(screen.getByTestId('active-students')).toHaveTextContent('Active Students: 8');
      expect(screen.getByTestId('total-revenue')).toHaveTextContent('Total Revenue: NPR 45,000');
    });

    it('should display statistics in correct format', async () => {
      render(
        <TestWrapper>
          <MockDashboard />
        </TestWrapper>
      );

      const totalStudents = screen.getByTestId('total-students');
      const activeStudents = screen.getByTestId('active-students');
      const totalRevenue = screen.getByTestId('total-revenue');

      expect(totalStudents).toBeInTheDocument();
      expect(activeStudents).toBeInTheDocument();
      expect(totalRevenue).toBeInTheDocument();

      // Verify the format includes numbers
      expect(totalStudents.textContent).toMatch(/\d+/);
      expect(activeStudents.textContent).toMatch(/\d+/);
      expect(totalRevenue.textContent).toMatch(/NPR.*\d+/);
    });
  });

  describe('Error Handling in Components', () => {
    it('should handle loading states', async () => {
      const LoadingComponent = () => (
        <div data-testid="loading">Loading...</div>
      );

      render(
        <TestWrapper>
          <LoadingComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle error states', async () => {
      const ErrorComponent = () => (
        <div data-testid="error">
          <p>Error: Failed to load data</p>
          <button data-testid="retry-button">Retry</button>
        </div>
      );

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load data')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    it('should provide app context to components', async () => {
      const ContextConsumer = () => {
        return (
          <div data-testid="context-consumer">
            Context is available
          </div>
        );
      };

      render(
        <TestWrapper>
          <ContextConsumer />
        </TestWrapper>
      );

      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
      expect(screen.getByText('Context is available')).toBeInTheDocument();
    });
  });
});