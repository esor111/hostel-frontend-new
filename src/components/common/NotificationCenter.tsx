import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((notifications) => {
      setNotifications(notifications);
    });

    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
    }
  };

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm text-gray-500">({unreadCount} unread)</span>
                  )}
                </h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.timestamp.toLocaleString()}
                              </p>
                            </div>
                            
                            <button
                              onClick={(e) => handleRemoveNotification(notification.id, e)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="mt-3 flex space-x-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.action();
                                  }}
                                  className={`px-3 py-1 text-xs rounded-md font-medium ${
                                    action.type === 'primary'
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Toast Notification Component for floating notifications
export const ToastNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((allNotifications) => {
      // Only show recent notifications as toasts (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentNotifications = allNotifications
        .filter(n => n.timestamp > fiveMinutesAgo && n.duration !== 0)
        .slice(0, 5); // Limit to 5 toasts
      
      setNotifications(recentNotifications);
    });

    return unsubscribe;
  }, []);

  const getToastBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full ${getToastBgColor(notification.type)} text-white rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            
            <button
              onClick={() => notificationService.removeNotification(notification.id)}
              className="ml-2 text-white opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  }
};