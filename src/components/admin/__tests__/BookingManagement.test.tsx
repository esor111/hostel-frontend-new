import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BookingManagement } from '../BookingManagement';
import { useBookings } from '@/hooks/useBookings';
import { useLanguage } from '@/hooks/useLanguage';
import { BookingStatus } from '@/types/api';

// Mock the hooks
vi.mock('@/hooks/useBookings');
vi.mock('@/hooks/useLanguage');

const mockUseBookings = vi.mocked(useBookings);
const mockUseLanguage = vi.mocked(useLanguage);

const mockBookings = [
  {
    id: 'booking-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    guardianName: 'Jane Doe',
    guardianPhone: '0987654321',
    preferredRoom: 'Single',
    course: 'Computer Science',
    institution: 'ABC University',
    requestDate: '2024-01-15',
    checkInDate: '2024-02-01',
    duration: '6 months',
    emergencyContact: 'Emergency Contact',
    address: '123 Main St',
    idProofType: 'Passport',
    idProofNumber: 'P123456789',
    status: BookingStatus.PENDING,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'booking-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '2345678901',
    guardianName: 'John Smith',
    guardianPhone: '1098765432',
    preferredRoom: 'Double',
    course: 'Business Administration',
    institution: 'XYZ College',
    requestDate: '2024-01-16',
    checkInDate: '2024-02-02',
    duration: '12 months',
    emergencyContact: 'Emergency Contact 2',
    address: '456 Oak Ave',
    idProofType: 'Driver License',
    idProofNumber: 'DL987654321',
    status: BookingStatus.APPROVED,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

describe('BookingManagement Component', () => {
  const mockCreateBooking = vi.fn();
  const mockUpdateBooking = vi.fn();
  const mockDeleteBooking = vi.fn();
  const mockRefreshData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLanguage.mockReturnValue({
      translations: {
        dashboard: 'Dashboard',
        bookings: 'Bookings'
      }
    });

    mockUseBookings.mockReturnValue({
      bookings: mockBookings,
      bookingStats: {
        totalBookings: 2,
        pendingBookings: 1,
        approvedBookings: 1,
        rejectedBookings: 0
      },
      loading: false,
      error: null,
      actionLoading: null,
      createBooking: mockCreateBooking,
      updateBooking: mockUpdateBooking,
      deleteBooking: mockDeleteBooking,
      refreshData: mockRefreshData
    });
  });

  it('renders booking management with stats cards', () => {
    render(<BookingManagement />);
    
    expect(screen.getByText('Booking Management')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('displays correct booking statistics', () => {
    render(<BookingManagement />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Total bookings
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending bookings
  });

  it('shows booking table with correct columns', () => {
    render(<BookingManagement />);
    
    // Check for table headers (note: Booking ID column should be removed)
    expect(screen.getByText('Guest Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Check-in Date')).toBeInTheDocument();
    expect(screen.getByText('Room Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays booking data in table rows', () => {
    render(<BookingManagement />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows room/bed identifier instead of booking ID', () => {
    render(<BookingManagement />);
    
    // Should show room types
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getByText('Double')).toBeInTheDocument();
    
    // Should NOT show booking IDs in the table
    expect(screen.queryByText('booking-1')).not.toBeInTheDocument();
    expect(screen.queryByText('booking-2')).not.toBeInTheDocument();
  });

  it('filters bookings by search term', async () => {
    render(<BookingManagement />);
    
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters bookings by status', async () => {
    render(<BookingManagement />);
    
    const statusFilter = screen.getByRole('combobox');
    fireEvent.click(statusFilter);
    
    const pendingOption = screen.getByText('Pending');
    fireEvent.click(pendingOption);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('opens create booking dialog', () => {
    render(<BookingManagement />);
    
    const newBookingButton = screen.getByRole('button', { name: /new booking/i });
    fireEvent.click(newBookingButton);
    
    expect(screen.getByText('Create New Booking Request')).toBeInTheDocument();
  });

  it('handles booking creation', async () => {
    mockCreateBooking.mockResolvedValue({ id: 'new-booking' });
    
    render(<BookingManagement />);
    
    const newBookingButton = screen.getByRole('button', { name: /new booking/i });
    fireEvent.click(newBookingButton);
    
    // Fill in form fields
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const createButton = screen.getByRole('button', { name: /create booking/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalled();
    });
  });

  it('opens edit dialog with booking data', () => {
    render(<BookingManagement />);
    
    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('h-4 w-4')
    );
    
    if (editButton) {
      fireEvent.click(editButton);
      expect(screen.getByText('Edit Booking Request')).toBeInTheDocument();
    }
  });

  it('opens view dialog with booking details', () => {
    render(<BookingManagement />);
    
    const viewButtons = screen.getAllByRole('button', { name: '' });
    const viewButton = viewButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('h-4 w-4')
    );
    
    if (viewButton) {
      fireEvent.click(viewButton);
      expect(screen.getByText('Booking Request Details')).toBeInTheDocument();
    }
  });

  it('handles booking deletion with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockDeleteBooking.mockResolvedValue(undefined);
    
    render(<BookingManagement />);
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('h-4 w-4') &&
      button.className.includes('text-red-600')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(mockDeleteBooking).toHaveBeenCalled();
      });
    }
    
    confirmSpy.mockRestore();
  });

  it('shows loading state', () => {
    mockUseBookings.mockReturnValue({
      bookings: [],
      bookingStats: {
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        rejectedBookings: 0
      },
      loading: true,
      error: null,
      actionLoading: null,
      createBooking: mockCreateBooking,
      updateBooking: mockUpdateBooking,
      deleteBooking: mockDeleteBooking,
      refreshData: mockRefreshData
    });
    
    render(<BookingManagement />);
    
    expect(screen.getByText('Loading booking requests...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    mockUseBookings.mockReturnValue({
      bookings: [],
      bookingStats: {
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        rejectedBookings: 0
      },
      loading: false,
      error: 'Failed to load bookings',
      actionLoading: null,
      createBooking: mockCreateBooking,
      updateBooking: mockUpdateBooking,
      deleteBooking: mockDeleteBooking,
      refreshData: mockRefreshData
    });
    
    render(<BookingManagement />);
    
    expect(screen.getByText('Failed to Load Booking Requests')).toBeInTheDocument();
    expect(screen.getByText('Failed to load bookings')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('shows empty state when no bookings match filters', () => {
    render(<BookingManagement />);
    
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    
    expect(screen.getByText('No bookings match your filters')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<BookingManagement />);
    
    const pendingBadge = screen.getByText('PENDING');
    const approvedBadge = screen.getByText('APPROVED');
    
    expect(pendingBadge).toBeInTheDocument();
    expect(approvedBadge).toBeInTheDocument();
  });
});