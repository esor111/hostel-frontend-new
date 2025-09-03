import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Analytics } from '../Analytics';

// Mock the useAnalytics hook
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    monthlyData: [
      { month: 'Jan', revenue: 50000, bookings: 15, occupancy: 85 },
      { month: 'Feb', revenue: 60000, bookings: 18, occupancy: 90 },
      { month: 'Mar', revenue: 55000, bookings: 12, occupancy: 80 }
    ],
    guestTypeData: [
      { name: 'Active Students', value: 78, color: '#07A64F' },
      { name: 'Pending Configuration', value: 15, color: '#1295D0' },
      { name: 'Graduated/Inactive', value: 7, color: '#FF6B6B' }
    ],
    loading: false,
    error: null,
    refreshData: vi.fn()
  })
}));

// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>
}));

describe('Analytics Component', () => {
  it('renders analytics dashboard with correct title', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Monthly Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monthly performance insights and revenue trends')).toBeInTheDocument();
  });

  it('displays key metrics with descriptions', () => {
    render(<Analytics />);
    
    // Check for Average Monthly Revenue
    expect(screen.getByText('Average Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total revenue earned per month on average')).toBeInTheDocument();
    
    // Check for Onboarded Users This Month (replaces Average Monthly Bookings)
    expect(screen.getByText('Onboarded Users This Month')).toBeInTheDocument();
    expect(screen.getByText('New students who joined the hostel this month')).toBeInTheDocument();
    
    // Check for Current Occupancy Rate
    expect(screen.getByText('Current Occupancy Rate')).toBeInTheDocument();
    expect(screen.getByText('Percentage of beds currently occupied')).toBeInTheDocument();
  });

  it('does not display average monthly bookings metric', () => {
    render(<Analytics />);
    
    // This metric should be removed
    expect(screen.queryByText('Average Monthly Bookings')).not.toBeInTheDocument();
  });

  it('displays booking per month trend chart', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Bookings Per Month Trend')).toBeInTheDocument();
    expect(screen.getByText('Monitor new student onboarding trends over time')).toBeInTheDocument();
  });

  it('displays charts with descriptions', () => {
    render(<Analytics />);
    
    // Monthly Revenue Trend
    expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Track revenue performance across different months')).toBeInTheDocument();
    
    // Student Status Distribution
    expect(screen.getByText('Student Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Breakdown of students by their current status in the hostel')).toBeInTheDocument();
    
    // Occupancy Rate Trend
    expect(screen.getByText('Occupancy Rate Trend')).toBeInTheDocument();
    expect(screen.getByText('Track how occupancy rates change over different months')).toBeInTheDocument();
  });

  it('does not display performance metrics section', () => {
    render(<Analytics />);
    
    // Performance metrics section should be removed
    expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
    expect(screen.queryByText('Average Stay Duration')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment Collection Rate')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Invoices')).not.toBeInTheDocument();
    expect(screen.queryByText('Paid Invoices')).not.toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<Analytics />);
    
    // Check that chart components are rendered
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(4);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});