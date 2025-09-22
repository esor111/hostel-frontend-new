import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Dashboard } from '../admin/Dashboard'

// Mock the hooks and context
vi.mock('../../hooks/useLanguage', () => ({
  useLanguage: vi.fn(() => ({
    translations: {}
  }))
}))

vi.mock('../../contexts/SafeAppContext', () => ({
  useAppContext: vi.fn(() => ({
    state: {
      students: [
        { id: 'STU001', name: 'John Doe', status: 'Active', currentBalance: 1000, advanceBalance: 0 },
        { id: 'STU002', name: 'Jane Smith', status: 'Active', currentBalance: 0, advanceBalance: 500 }
      ],
      bookingRequests: [
        { id: 'REQ001', name: 'Test User', status: 'Pending', requestDate: '2025-01-15', preferredRoom: '101' }
      ],
      invoices: [
        { id: 'INV001', status: 'Paid', total: 5000 },
        { id: 'INV002', status: 'Pending', total: 3000 }
      ]
    }
  }))
}))

vi.mock('../../hooks/useNavigation', () => ({
  useNavigation: vi.fn(() => ({
    goToBookings: vi.fn(),
    goToLedger: vi.fn(),
    goToStudentLedger: vi.fn()
  }))
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render welcome header', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to Kaha Hostel')).toBeInTheDocument()
    })
  })

  it('should display student statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument()
    })
    
    const studentSection = screen.getByText('Total Students').closest('div')
    expect(studentSection).toHaveTextContent('2')
  })

  it('should display revenue statistics', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })
    
    const revenueSection = screen.getByText('Total Revenue').closest('div')
    expect(revenueSection).toHaveTextContent('Rs 5,000')
  })

  it('should display pending bookings', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Pending Bookings')).toBeInTheDocument()
    })
    
    const bookingSection = screen.getByText('Pending Bookings').closest('div')
    expect(bookingSection).toHaveTextContent('1')
  })
})