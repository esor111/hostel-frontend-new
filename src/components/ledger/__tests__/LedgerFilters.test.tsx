import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LedgerFilters, LedgerFilterOptions } from '../LedgerFilters';
import { subDays } from 'date-fns';

describe('LedgerFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnApplyFilters = vi.fn();
  const mockOnClearFilters = vi.fn();

  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    onApplyFilters: mockOnApplyFilters,
    onClearFilters: mockOnClearFilters,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter component with correct title', () => {
    render(<LedgerFilters {...defaultProps} />);
    expect(screen.getByText('Ledger Filters')).toBeInTheDocument();
  });

  it('shows active filter count when filters are applied', () => {
    const filtersWithData: LedgerFilterOptions = {
      preset: 'lastWeek',
      entryType: 'Payment',
    };

    render(<LedgerFilters {...defaultProps} filters={filtersWithData} />);
    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('expands and shows filter options when expand button is clicked', async () => {
    render(<LedgerFilters {...defaultProps} />);
    
    const expandButton = screen.getByText('Expand');
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Quick Filters')).toBeInTheDocument();
      expect(screen.getByText('Last Week')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
    });
  });

  it('calls onFiltersChange when preset filter is selected', async () => {
    render(<LedgerFilters {...defaultProps} />);
    
    // Expand filters first
    fireEvent.click(screen.getByText('Expand'));
    
    await waitFor(() => {
      const lastWeekButton = screen.getByText('Last Week');
      fireEvent.click(lastWeekButton);
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'lastWeek',
        dateRange: expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date),
        }),
      })
    );
  });

  it('calls onApplyFilters when apply button is clicked', async () => {
    render(<LedgerFilters {...defaultProps} />);
    
    // Expand filters first
    fireEvent.click(screen.getByText('Expand'));
    
    await waitFor(() => {
      const applyButton = screen.getByText('Apply Filters');
      fireEvent.click(applyButton);
    });

    expect(mockOnApplyFilters).toHaveBeenCalled();
  });

  it('calls onClearFilters when clear button is clicked', async () => {
    const filtersWithData: LedgerFilterOptions = {
      preset: 'lastWeek',
    };

    render(<LedgerFilters {...defaultProps} filters={filtersWithData} />);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('shows loading state when loading prop is true', async () => {
    render(<LedgerFilters {...defaultProps} loading={true} />);
    
    // Expand filters first
    fireEvent.click(screen.getByText('Expand'));
    
    await waitFor(() => {
      const applyButton = screen.getByText('Applying...');
      expect(applyButton).toBeInTheDocument();
    });
  });

  it('displays filter summary when filters are active and collapsed', () => {
    const filtersWithData: LedgerFilterOptions = {
      preset: 'lastWeek',
      entryType: 'Payment',
    };

    render(<LedgerFilters {...defaultProps} filters={filtersWithData} />);
    
    expect(screen.getByText(/Active filters:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Week/)).toBeInTheDocument();
  });
});