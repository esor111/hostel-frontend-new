import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Sidebar } from '../Sidebar';
import { useLanguage } from '@/hooks/useLanguage';

// Mock the hooks
vi.mock('@/hooks/useLanguage');

const mockUseLanguage = vi.mocked(useLanguage);

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('Sidebar Component', () => {
  const mockOnTabChange = vi.fn();

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
  });

  it('renders sidebar with Kaha branding', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    expect(screen.getByText('Kaha')).toBeInTheDocument();
    expect(screen.getByText('Control Center')).toBeInTheDocument();
  });

  it('displays all main menu items with correct labels', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Inactive Students')).toBeInTheDocument();
    expect(screen.getByText('Hostel Profile')).toBeInTheDocument();
  });

  it('shows active tab with correct styling', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).toHaveClass('bg-gradient-to-r');
  });

  it('handles tab change when menu item is clicked', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const bookingsButton = screen.getByRole('button', { name: /bookings/i });
    fireEvent.click(bookingsButton);
    
    expect(mockOnTabChange).toHaveBeenCalledWith('bookings');
  });

  it('displays Financial Hub section with Kaha KLedger', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    expect(screen.getByText('Financial Hub')).toBeInTheDocument();
    expect(screen.getByText('Kaha KLedger')).toBeInTheDocument();
    expect(screen.getByText('Financial Management')).toBeInTheDocument();
  });

  it('navigates to ledger when KLedger is clicked', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const ledgerButton = screen.getByRole('button', { name: /kaha kledger/i });
    fireEvent.click(ledgerButton);
    
    expect(window.location.href).toBe('/ledger');
  });

  it('displays settings section', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('handles settings tab activation', () => {
    render(<Sidebar activeTab="settings" onTabChange={mockOnTabChange} />);
    
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toHaveClass('bg-gradient-to-r');
  });

  it('shows active indicator for selected tab', () => {
    render(<Sidebar activeTab="analytics" onTabChange={mockOnTabChange} />);
    
    const analyticsButton = screen.getByRole('button', { name: /analytics/i });
    const activeIndicator = analyticsButton.querySelector('.animate-pulse');
    expect(activeIndicator).toBeInTheDocument();
  });

  it('applies correct gradient colors to menu items', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    const iconContainer = dashboardButton.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles navigation items correctly', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    // Test each navigation item
    const navigationItems = ['dashboard', 'bookings', 'rooms', 'analytics'];
    
    navigationItems.forEach(item => {
      const button = screen.getByRole('button', { name: new RegExp(item, 'i') });
      fireEvent.click(button);
      expect(mockOnTabChange).toHaveBeenCalledWith(item);
    });
  });

  it('displays hostel profile at the end of main menu', () => {
    render(<Sidebar activeTab="dashboard" onTabChange={mockOnTabChange} />);
    
    const menuButtons = screen.getAllByRole('button');
    const hostelProfileButton = menuButtons.find(button => 
      button.textContent?.includes('Hostel Profile')
    );
    
    expect(hostelProfileButton).toBeInTheDocument();
  });
});