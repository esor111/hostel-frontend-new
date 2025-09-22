import { useState, useCallback } from 'react';
import { notificationApiService, NotificationApiResponse } from '../services/notificationApiService';
import { notificationService } from '../services/notificationService';

export interface UseNotificationsReturn {
  // API methods
  sendToUser: (userId: string, title: string, message: string) => Promise<NotificationApiResponse>;
  sendToUsers: (userIds: string[], title: string, message: string) => Promise<NotificationApiResponse>;
  broadcastNotification: (userIds: string[], title: string, message: string) => Promise<NotificationApiResponse>;
  
  // Attendance specific methods
  sendAttendanceNotification: (studentId: string, title: string, message: string) => Promise<NotificationApiResponse>;
  sendLateArrivalNotification: (studentId: string, studentName: string, lateMinutes: number) => Promise<NotificationApiResponse>;
  sendAbsenceNotification: (studentId: string, studentName: string, date?: string) => Promise<NotificationApiResponse>;
  
  // Local notification methods (for UI feedback)
  showSuccess: (title: string, message: string) => Promise<string>;
  showError: (title: string, message: string) => Promise<string>;
  showWarning: (title: string, message: string) => Promise<string>;
  showInfo: (title: string, message: string) => Promise<string>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (successMessage) {
        await notificationService.showSuccess('Success', successMessage);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      await notificationService.showError('Error', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // API methods
  const sendToUser = useCallback(async (
    userId: string,
    title: string,
    message: string
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.sendToUser({ userId, title, message }),
      'Notification sent successfully'
    );
  }, [handleApiCall]);

  const sendToUsers = useCallback(async (
    userIds: string[],
    title: string,
    message: string
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.sendToUsers({ userIds, title, message }),
      `Notification sent to ${userIds.length} users`
    );
  }, [handleApiCall]);

  const broadcastNotification = useCallback(async (
    userIds: string[],
    title: string,
    message: string
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.broadcastNotification({ userIds, title, message }),
      `Notification broadcasted to ${userIds.length} users`
    );
  }, [handleApiCall]);

  // Attendance specific methods
  const sendAttendanceNotification = useCallback(async (
    studentId: string,
    title: string,
    message: string
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.sendAttendanceNotification(studentId, title, message),
      'Attendance notification sent'
    );
  }, [handleApiCall]);

  const sendLateArrivalNotification = useCallback(async (
    studentId: string,
    studentName: string,
    lateMinutes: number
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.sendLateArrivalNotification(studentId, studentName, lateMinutes),
      'Late arrival notification sent'
    );
  }, [handleApiCall]);

  const sendAbsenceNotification = useCallback(async (
    studentId: string,
    studentName: string,
    date?: string
  ): Promise<NotificationApiResponse> => {
    return handleApiCall(
      () => notificationApiService.sendAbsenceNotification(studentId, studentName, date),
      'Absence notification sent'
    );
  }, [handleApiCall]);

  // Local notification methods (for UI feedback)
  const showSuccess = useCallback(async (title: string, message: string): Promise<string> => {
    return notificationService.showSuccess(title, message);
  }, []);

  const showError = useCallback(async (title: string, message: string): Promise<string> => {
    return notificationService.showError(title, message);
  }, []);

  const showWarning = useCallback(async (title: string, message: string): Promise<string> => {
    return notificationService.showWarning(title, message);
  }, []);

  const showInfo = useCallback(async (title: string, message: string): Promise<string> => {
    return notificationService.showInfo(title, message);
  }, []);

  return {
    // API methods
    sendToUser,
    sendToUsers,
    broadcastNotification,
    
    // Attendance specific methods
    sendAttendanceNotification,
    sendLateArrivalNotification,
    sendAbsenceNotification,
    
    // Local notification methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // State
    isLoading,
    error
  };
};