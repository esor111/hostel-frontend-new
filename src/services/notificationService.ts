export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: NotificationAction[];
}

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private maxNotifications = 100;

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<string> {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type,
      duration: options.duration || 5000,
      timestamp: new Date(),
      read: false,
      actions: options.actions
    };

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-remove after duration (if specified)
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    // Limit total notifications
    if (this.notifications.size > this.maxNotifications) {
      const oldestId = Array.from(this.notifications.keys())[0];
      this.notifications.delete(oldestId);
    }

    console.log(`📢 Notification shown: ${options.title}`);
    return id;
  }

  /**
   * Remove a notification
   */
  removeNotification(id: string): boolean {
    const removed = this.notifications.delete(id);
    if (removed) {
      this.notifyListeners();
    }
    return removed;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter(n => !n.read);
  }

  /**
   * Get notification count
   */
  getNotificationCount(): { total: number; unread: number } {
    const notifications = this.getNotifications();
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length
    };
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  /**
   * Clear old notifications (older than specified days)
   */
  clearOldNotifications(days: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let removedCount = 0;
    this.notifications.forEach((notification, id) => {
      if (notification.timestamp < cutoffDate) {
        this.notifications.delete(id);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.notifyListeners();
    }

    return removedCount;
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Show success notification
   */
  async showSuccess(title: string, message: string, duration?: number): Promise<string> {
    return this.showNotification({
      title,
      message,
      type: 'success',
      duration
    });
  }

  /**
   * Show error notification
   */
  async showError(title: string, message: string, duration?: number): Promise<string> {
    return this.showNotification({
      title,
      message,
      type: 'error',
      duration: duration || 10000 // Errors stay longer by default
    });
  }

  /**
   * Show warning notification
   */
  async showWarning(title: string, message: string, duration?: number): Promise<string> {
    return this.showNotification({
      title,
      message,
      type: 'warning',
      duration
    });
  }

  /**
   * Show info notification
   */
  async showInfo(title: string, message: string, duration?: number): Promise<string> {
    return this.showNotification({
      title,
      message,
      type: 'info',
      duration
    });
  }

  /**
   * Show billing notification with actions
   */
  async showBillingNotification(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    actions?: NotificationAction[]
  ): Promise<string> {
    return this.showNotification({
      title,
      message,
      type,
      duration: 0, // Don't auto-dismiss billing notifications
      actions
    });
  }

  /**
   * Show system notification (browser notification if permission granted)
   */
  async showSystemNotification(title: string, message: string, icon?: string): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: icon || '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: icon || '/favicon.ico'
          });
        }
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  /**
   * Check if browser notifications are supported and permitted
   */
  canShowSystemNotifications(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

// Export singleton instance
export const notificationService = new NotificationService();