import { apiClient } from './apiClient';

// Use the configured API client which handles authentication automatically

export interface SendToStudentsPayload {
  studentIds: string[];
  title: string;
  message: string;
  imageUrl?: string;
}

// Legacy interface for backward compatibility
export interface NotificationPayload {
  receiverUserIds: string[];
  senderUserId: string;
  title: string;
  message: string;
  meta: {};
  shouldSave: boolean;
}

export const notificationApiService = {
  // NEW: Send notifications to selected students via our backend
  async sendToStudents(studentIds: string[], title: string, message: string, imageUrl?: string): Promise<any> {
    const payload: SendToStudentsPayload = {
      studentIds,
      title,
      message,
      imageUrl
    };

    try {
      // Use apiClient which automatically adds authentication headers
      const response = await apiClient.post('/notification/send-to-students', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending notification to students:', error);
      throw error;
    }
  },

  // LEGACY: Keep for backward compatibility (now uses new method)
  async sendPushNotification(title: string, message: string): Promise<any> {
    console.warn('sendPushNotification is deprecated. Use sendToStudents instead.');
    
    // For legacy calls, send to hardcoded student ID
    const legacyStudentIds = ["afc70db3-6f43-4882-92fd-4715f25ffc95"];
    return this.sendToStudents(legacyStudentIds, title, message);
  }
};