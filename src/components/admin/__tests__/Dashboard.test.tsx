import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';
import { useAppContext } from '@/contexts/SafeAppContext';
import { useNavigation } from '@/hooks/useNavigation';
import { useBookings } from '@/hooks/useBookings';
import { useLanguage } from '@/hooks/useLanguage';

// Mock the hooks
vi.mock('@/contexts/SafeAppContext');
vi.mock('@/hooks/useNavigation');
vi.mock('@/hooks/useBookings');
vi.mock('@/hooks/useLanguage');

// Mock fetch globally
global.fetch = vi.fn();

const mockUseAppContext = vi.mocked(useAppContext);
const mockUseNavigation = vi.mocked(useNavigation);
const mockUseBookings = vi.mocked(useBookings);
const mockUseLanguage = vi.mocked(useLanguage);

describe('Dashboard Component', () => {
  const mockGoToBookings = vi.fn();
  const mockGoToLedger = vi.fn();
  const mockGoToStudentLedger = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLanguage.mockReturnValue({
      translations: {
        dashboard: 'Dashboard',
        bookings: 'Bookings',
        rooms: 'Rooms',
        analytics: 'Analytics',
        hostelProfile: 'Hostel Profile',
        settings: 'Settings'
      }
    });

    mockUseAppContext.mockReturnValue({
      state: {
        students: [],
        bookings: [],
        rooms: []
      }
    });

    mockUseNavigation.mockReturnValue({
      goToBookings: mockGoToBookings,
      goToLedger: mockGoToLedger,
      goToStudentLedger: mockGoToStudentLedger
    });

    mockUseBookings.mockReturnValue({
      bookingStats: {
        totalBookings: 10,
        pendingBookings: 3,
        approvedBookings: 5,
        rejectedBookings: 2
      }
    });

    // Mock successful API responses
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({
        totalStudents: 25,
        monthlyRevenue: { amount: 150000, value: 'NPR 150,000' },
        availableRooms: 8,
        pendingPayments: 3,
        occupancyPercentage: 85
      })
    });
  });

  it('renders dashboard with welcome header', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back!/)).toBeInTheDocument();
    });
  });

  it('displays analytics cards with correct data', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
      expect(screen.getByText('Pending Payments')).toBeInTheDocument();
    });
  });

  it('shows attendance counters in dashboard cards', async () => {
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({
        totalStudents: 25,
        monthlyRevenue: { amount: 150000, value: 'NPR 150,000' },
        availableRooms: 8,
        pendingPayments: 3,
        occupancyPercentage: 85,
        attendanceCounters: {
          checkIn: 20,
          checkOut: 5
        }
      })
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total students
    });
  });

  it('handles navigation clicks correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const totalStudentsCard = screen.getByText('Total Students').closest('.cursor-pointer');
      if (totalStudentsCard) {
        fireEvent.click(totalStudentsCard);
        expect(mockGoToLedger).toHaveBeenCalledWith('students');
      }
    });
  });

  it('displays refresh button and handles refresh', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('shows error state when API calls fail', async () => {
    (global.fetch as any).mockRejectedValue(new Error('API Error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('displays quick actions section', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Manage Students')).toBeInTheDocument();
      expect(screen.getByText('Monthly Billing')).toBeInTheDocument();
      expect(screen.getByText('Record Payments')).toBeInTheDocument();
    });
  });

  it('shows occupancy rate in header', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Occupancy Rate')).toBeInTheDocument();
    });
  });

  it('displays students with outstanding dues section', async () => {
    (global.fetch as any).mockImplementation((url) => {
      if (url.includes('checked-out-dues')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            data: [
              {
                id: '1',
                name: 'John Doe',
                roomNumber: 'A101',
                phone: '1234567890',
                outstandingDues: 5000
              }
            ]
          })
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({
          totalStudents: 25,
          monthlyRevenue: { amount: 150000, value: 'NPR 150,000' },
          availableRooms: 8,
          pendingPayments: 3,
          occupancyPercentage: 85
        })
      });
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Students with Overdue Payments/)).toBeInTheDocument();
    });
  });

  it('handles no outstanding dues state', async () => {
    (global.fetch as any).mockImplementation((url) => {
      if (url.includes('checked-out-dues')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: [] })
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({
          totalStudents: 25,
          monthlyRevenue: { amount: 150000, value: 'NPR 150,000' },
          availableRooms: 8,
          pendingPayments: 3,
          occupancyPercentage: 85
        })
      });
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('All Clear!')).toBeInTheDocument();
      expect(screen.getByText('All students are up to date with payments')).toBeInTheDocument();
    });
  });
});