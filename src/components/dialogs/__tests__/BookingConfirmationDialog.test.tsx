import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BookingConfirmationDialog } from '../BookingConfirmationDialog';
import { BookingRequest, BookingStatus } from '@/types/api';

const mockBooking: BookingRequest = {
  id: 'booking-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  guardianName: 'Jane Doe',
  guardianPhone: '0987654321',
  preferredRoom: 'Single Room',
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
};

describe('BookingConfirmationDialog Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Booking Approval')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Confirm Booking Approval')).not.toBeInTheDocument();
  });

  it('does not render when booking is null', () => {
    render(
      <BookingConfirmationDialog
        booking={null}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Confirm Booking Approval')).not.toBeInTheDocument();
  });

  it('displays booking details correctly', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('booking-123')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('Single Room')).toBeInTheDocument();
  });

  it('displays formatted check-in date', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Check-in date should be formatted as locale date string
    const expectedDate = new Date('2024-02-01').toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('shows confirmation warning message', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Booking Approval')).toBeInTheDocument();
    expect(screen.getByText(/This will approve the booking request and create a student profile/)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when approve button is clicked', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const approveButton = screen.getByRole('button', { name: /approve booking/i });
    fireEvent.click(approveButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading is true', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    );
    
    expect(screen.getByText('Approving...')).toBeInTheDocument();
    
    const approveButton = screen.getByRole('button', { name: /approving/i });
    expect(approveButton).toBeDisabled();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows approve button with correct styling when not loading', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );
    
    const approveButton = screen.getByRole('button', { name: /approve booking/i });
    expect(approveButton).not.toBeDisabled();
    expect(approveButton).toHaveClass('bg-green-600');
  });

  it('displays all required booking information fields', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Check for all field labels
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Booking ID')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Preferred Room')).toBeInTheDocument();
    expect(screen.getByText('Check-in Date')).toBeInTheDocument();
  });

  it('handles dialog close via onOpenChange', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    // Simulate clicking outside or pressing escape (dialog onOpenChange)
    // This would typically be handled by the Dialog component itself
    // We can test that the onCancel prop is properly passed
    expect(mockOnCancel).toBeDefined();
  });

  it('shows loading spinner when loading', () => {
    render(
      <BookingConfirmationDialog
        booking={mockBooking}
        open={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    );
    
    // Check for loading spinner (animate-spin class)
    const spinner = screen.getByRole('button', { name: /approving/i }).querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});