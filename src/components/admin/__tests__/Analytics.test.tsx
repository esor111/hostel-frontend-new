import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Analytics } from '../Analytics';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock the hooks
vi.mock('@/hooks/useAnalytics');

const mockUseAnalytics = vi.mocked(useAnalytics);

const mockMonthlyData = [
  { month: 'Jan', revenue: 120000, bookings: 15, occupancy: 80 },
  { month: 'Feb', revenue: 135000, bookings: 18, occupancy: 85 },
  { month: 'Mar', revenue: 150000, bookings: 20, occupancy: 90 },
  { month: 'Apr', revenue: 140000, bookings: 17, occupancy: 87 },
  { month: 'May', revenue: 160000, bookings: 22, occupancy: 92 }
];

const mockGuestTypeData = [
  { name: 'Active', value: 45 },
  { name: 'Inactive', value: 8 },
  { name: 'Graduated', value: 12 },
  { name: 'Suspended', value: 2 }
];

describe('Analytics Component', () => {
  const mockRefreshData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAnalytics.mockReturnValue({
      monthlyData: mockMonthlyData,
      guestTypeData: mockGuestTypeData,
      loading: false,
      error: null,
      refreshData: mockRefreshData
    });
  });

  it('renders analytics dashboard with header', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Monthly Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monthly performance insights and revenue trends')).toBeInTheDocument();
  });

  it('displays key metrics cards with descriptions', () => {
    render(<Analytics />);
    
    // Check for metric titles and descriptions
    expect(screen.getByText('Average Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total revenue earned per month on average')).toBeInTheDocument();
    
    expect(screen.getByText('Onboarded Users This Month')).toBeInTheDocument();
    expect(screen.getByText('New students who joined the hostel this month')).toBeInTheDocument();
    
    expect(screen.getByText('Current Occupancy Rate')).toBeInTheDocument();
    expect(screen.getByText('Percentage of beds currently occupied')).toBeInTheDocument();
  });

  it('calculates and displays average monthly revenue correctly', () => {
    render(<Analytics />);
    
    // Calculate expected average: (120000 + 135000 + 150000 + 140000 + 160000) / 5 = 141000
    const expectedAverage = 141000;
    expect(screen.getByText(`Rs ${expectedAverage.toLocaleString()}`)).toBeInTheDocument();
  });

  it('displays current month onboarded users', () => {
    render(<Analytics />);
    
    // Should show the bookings from the last month (May: 22)
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('displays current occupancy rate', () => {
    render(<Analytics />);
    
    // Should show the occupancy from the last month (May: 92%)
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders monthly revenue trend chart', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Track revenue performance across different months')).toBeInTheDocument();
  });

  it('renders bookings per month trend chart', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Bookings Per Month Trend')).toBeInTheDocument();
    expect(screen.getByText('Monitor new student onboarding trends over time')).toBeInTheDocument();
  });

  it('renders student status distribution chart', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Student Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Breakdown of students by their current status in the hostel')).toBeInTheDocument();
  });

  it('renders occupancy rate trend chart', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Occupancy Rate Trend')).toBeInTheDocument();
    expect(screen.getByText('Track how occupancy rates change over different months')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseAnalytics.mockReturnValue({
      monthlyData: [],
      guestTypeData: [],
      loading: true,
      error: null,
      refreshData: mockRefreshData
    });
    
    render(<Analytics />);
    
    expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    mockUseAnalytics.mockReturnValue({
      monthlyData: [],
      guestTypeData: [],
      loading: false,
      error: 'Failed to load analytics data',
      refreshData: mockRefreshData
    });
    
    render(<Analytics />);
    
    expect(screen.getByText('Failed to Load Analytics')).toBeInTheDocument();
    expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('does not display average monthly booking metric', () => {
    render(<Analytics />);
    
    // This metric should be removed according to requirements
    expect(screen.queryByText('Average Monthly Booking')).not.toBeInTheDocument();
    expect(screen.queryByText('average monthly booking')).not.toBeInTheDocument();
  });

  it('does not display performance metrics section', () => {
    render(<Analytics />);
    
    // Performance metrics section should be removed
    expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
  });

  it('includes metric descriptions for better understanding', () => {
    render(<Analytics />);
    
    // All metrics should have descriptive text
    const descriptions = [
      'Total revenue earned per month on average',
      'New students who joined the hostel this month',
      'Percentage of beds currently occupied'
    ];
    
    descriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', () => {
    mockUseAnalytics.mockReturnValue({
      monthlyData: [],
      guestTypeData: [],
      loading: false,
      error: null,
      refreshData: mockRefreshData
    });
    
    render(<Analytics />);
    
    // Should still render the component structure
    expect(screen.getByText('Monthly Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Rs 0')).toBeInTheDocument(); // Average revenue with no data
    expect(screen.getByText('0')).toBeInTheDocument(); // Onboarded users with no data
    expect(screen.getByText('0%')).toBeInTheDocument(); // Occupancy rate with no data
  });

  it('displays chart section titles with icons', () => {
    render(<Analytics />);
    
    // Check that chart sections have proper titles and descriptions
    expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Bookings Per Month Trend')).toBeInTheDocument();
    expect(screen.getByText('Student Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Occupancy Rate Trend')).toBeInTheDocument();
  });
});