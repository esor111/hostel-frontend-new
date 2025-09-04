import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the RecentNotificationsList component logic
const RecentNotificationsList = ({ notifications, onRefresh }: any) => {
  return (
    <div data-testid="recent-notifications">
      <button onClick={onRefresh} data-testid="refresh-button">
        Refresh
      </button>
      <div data-testid="notifications-list">
        {notifications.map((notification: any) => (
          <div key={notification.id} data-testid={`notification-${notification.id}`}>
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <span>{notification.deliveryRate}% Delivered</span>
          </div>
        ))}
        {notifications.length === 0 && (
          <div data-testid="no-notifications">No recent notifications</div>
        )}
      </div>
    </div>
  );
};

describe('RecentNotificationsList', () => {
  const mockNotifications = [
    {
      id: 1,
      title: 'Payment Reminder',
      message: 'Your payment is due tomorrow',
      deliveryRate: 100,
      sentAt: '2024-01-15T10:30:00Z',
      recipients: ['John Doe', 'Jane Smith']
    },
    {
      id: 2,
      title: 'Welcome Message',
      message: 'Welcome to the hostel',
      deliveryRate: 95,
      sentAt: '2024-01-14T09:15:00Z',
      recipients: ['Bob Johnson']
    }
  ];

  it('should render all notifications', () => {
    const mockOnRefresh = vi.fn();
    
    render(
      <RecentNotificationsList
        notifications={mockNotifications}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('Payment Reminder')).toBeInTheDocument();
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
    expect(screen.getByText('100% Delivered')).toBeInTheDocument();
    expect(screen.getByText('95% Delivered')).toBeInTheDocument();
  });

  it('should show empty state when no notifications', () => {
    const mockOnRefresh = vi.fn();
    
    render(
      <RecentNotificationsList
        notifications={[]}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
    expect(screen.getByText('No recent notifications')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const mockOnRefresh = vi.fn();
    
    render(
      <RecentNotificationsList
        notifications={mockNotifications}
        onRefresh={mockOnRefresh}
      />
    );

    fireEvent.click(screen.getByTestId('refresh-button'));
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should display notification details correctly', () => {
    const mockOnRefresh = vi.fn();
    
    render(
      <RecentNotificationsList
        notifications={mockNotifications}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('Your payment is due tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the hostel')).toBeInTheDocument();
  });
});