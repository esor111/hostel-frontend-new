import axios from 'axios';

const NOTIFICATION_API_BASE_URL = 'https://api.kaha.com.np/notifications/api/v3';

export interface NotificationPayload {
  receiverUserIds: string[];
  senderUserId: string;
  title: string;
  message: string;
  meta: {};
  shouldSave: boolean;
}

export const notificationApiService = {
  async sendPushNotification(title: string, message: string): Promise<any> {
    const payload: NotificationPayload = {
      receiverUserIds: ["afc70db3-6f43-4882-92fd-4715f25ffc95"],
      senderUserId: "c5c3d135-4968-450b-9fca-57f01e0055f7",
      title,
      message,
      meta: {},
      shouldSave: true
    };

    try {
      const response = await axios.post(`${NOTIFICATION_API_BASE_URL}/push-notifications`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
};