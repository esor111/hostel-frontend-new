import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CheckoutConfirmationDialog } from '../CheckoutConfirmationDialog';

const mockStudent = {
  id: '1',
  name: 'John Doe',
  roomNumber: '101',
  course: 'Computer Science',
  currentBalance: 5000,
  baseMonthlyFee: 3000,
  laundryFee: 500,
  foodFee: 1000
};

const mockCurrentMonthBilling = {
  amount: 1500,
  period: 'January 2025',
  daysCharged: 15
};

describe('CheckoutConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    student: mockStudent,
    totalDueAmount: 6500,
    currentMonthBilling: mockCurrentMonthBilling,
    loading: false
  };

  it('renders checkout confirmation dialog with student information', () => {
    render(<CheckoutConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Student Checkout')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  it('displays financial summary correctly', () => {
    render(<CheckoutConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Financial Summary')).toBeInTheDocument();
    expect(screen.getByText('NPR 5,000 (Due)')).toBeInTheDocument();
    expect(screen.getByText('NPR 1,500')).toBeInTheDocument(); // Partial month billing
    expect(screen.getByText('NPR 6,500 (Outstanding)')).toBeInTheDocument(); // Final settlement
  });

  it('shows validation errors when checkout reason is empty', async () => {
    render(<CheckoutConfirmationDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm Checkout');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Checkout reason is required')).toBeInTheDocument();
    });
  });

  it('shows validation errors when checkout reason is too short', async () => {
    render(<CheckoutConfirmationDialog {...defaultProps} />);
    
    const reasonInput = screen.getByPlaceholderText('e.g., Course completion, Transfer, Personal reasons');
    fireEvent.change(reasonInput, { target: { value: 'abc' } });
    
    const confirmButton = screen.getByText('Confirm Checkout');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Checkout reason must be at least 5 characters long')).toBeInTheDocument();
    });
  });

  it('calls onConfirm with correct data when form is valid', async () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
    render(<CheckoutConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />);
    
    const reasonInput = screen.getByPlaceholderText('e.g., Course completion, Transfer, Personal reasons');
    fireEvent.change(reasonInput, { target: { value: 'Course completion' } });
    
    const confirmButton = screen.getByText('Confirm Checkout');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith({
        reason: 'Course completion',
        finalBalance: 6500,
        clearRoom: true,
        refundAmount: 0,
        deductionAmount: 0,
        notes: 'Checkout processed: Course completion'
      });
    });
  });

  it('handles deduction amount correctly', async () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
    render(<CheckoutConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />);
    
    const reasonInput = screen.getByPlaceholderText('e.g., Course completion, Transfer, Personal reasons');
    fireEvent.change(reasonInput, { target: { value: 'Course completion' } });
    
    const deductionInput = screen.getByLabelText('Deduction Amount (NPR)');
    fireEvent.change(deductionInput, { target: { value: '1000' } });
    
    const confirmButton = screen.getByText('Confirm Checkout');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith({
        reason: 'Course completion',
        finalBalance: 5500, // 6500 - 1000
        clearRoom: true,
        refundAmount: 0,
        deductionAmount: 1000,
        notes: 'Checkout processed: Course completion'
      });
    });
  });

  it('shows refund scenario when final balance is negative', () => {
    const propsWithCredit = {
      ...defaultProps,
      student: { ...mockStudent, currentBalance: -2000 }, // Credit balance
      totalDueAmount: -500 // Net credit after partial billing
    };
    
    render(<CheckoutConfirmationDialog {...propsWithCredit} />);
    
    expect(screen.getByText('NPR 500 (Refund)')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<CheckoutConfirmationDialog {...defaultProps} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state when confirming', async () => {
    const mockOnConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<CheckoutConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />);
    
    const reasonInput = screen.getByPlaceholderText('e.g., Course completion, Transfer, Personal reasons');
    fireEvent.change(reasonInput, { target: { value: 'Course completion' } });
    
    const confirmButton = screen.getByText('Confirm Checkout');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing Checkout...')).toBeInTheDocument();
    });
  });
});