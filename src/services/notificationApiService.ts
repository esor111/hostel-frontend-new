import { apiService } from './apiService';

export interface SendNotificationRequest {
  receiverUserIds: string[];
  senderUserId?: string;
  title: string;
  message: string;
  shouldSave?: boolean;
}

export interface SendToUserRequest {
  userId: string;
  title: string;
  message: string;
}

export interface SendToUsersRequest {
  userIds: string[];
  title: string;
  message: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  userIds: string[];
}

export interface NotificationApiResponse {
  success: boolean;
  data?: any;
  message: string;
  statusCode?: number;
}

class NotificationApiService {
  private readonly baseUrl = '/notifications';

  /**
   * Send notification via external microservice
   */
  async sendNotification(request: SendNotificationRequest): Promise<NotificationApiResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/send`, request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  /**
   * Send notification to single user
   */
  async sendToUser(request: SendToUserRequest): Promise<NotificationApiResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/send-to-user`, request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to send notification to user:', error);
      throw new Error(error.response?.data?.message || 'Failed to send notification to user');
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(request: SendToUsersRequest): Promise<NotificationApiResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/send-to-users`, request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to send notification to users:', error);
      throw new Error(error.response?.data?.message || 'Failed to send notification to users');
    }
  }

  /**
   * Broadcast notification to all users
   */
  async broadcastNotification(request: BroadcastNotificationRequest): Promise<NotificationApiResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/broadcast`, request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to broadcast notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to broadcast notification');
    }
  }

  /**
   * Send attendance notification to student
   */
  async sendAttendanceNotification(
    studentId: string,
    title: string,
    message: string
  ): Promise<NotificationApiResponse> {
    return this.sendToUser({
      userId: studentId,
      title,
      message
    });
  }

  /**
   * Send attendance notifications to multiple students
   */
  async sendAttendanceNotifications(
    studentIds: string[],
    title: string,
    message: string
  ): Promise<NotificationApiResponse> {
    return this.sendToUsers({
      userIds: studentIds,
      title,
      message
    });
  }

  /**
   * Send late arrival notification
   */
  async sendLateArrivalNotification(
    studentId: string,
    studentName: string,
    lateMinutes: number
  ): Promise<NotificationApiResponse> {
    return this.sendToUser({
      userId: studentId,
      title: 'Late Arrival Alert',
      message: `${studentName} arrived ${lateMinutes} minutes late today.`
    });
  }

  /**
   * Send absence notification
   */
  async sendAbsenceNotification(
    studentId: string,
    studentName: string,
    date?: string
  ): Promise<NotificationApiResponse> {
    const dateStr = date || new Date().toLocaleDateString();
    return this.sendToUser({
      userId: studentId,
      title: 'Attendance Alert',
      message: `${studentName} was marked absent on ${dateStr}.`
    });
  }

  /**
   * Send bulk attendance summary to admin
   */
  async sendAttendanceSummary(
    adminId: string,
    summary: {
      total: number;
      present: number;
      absent: number;
      late: number;
      date: string;
    }
  ): Promise<NotificationApiResponse> {
    return this.sendToUser({
      userId: adminId,
      title: 'Daily Attendance Summary',
      message: `Attendance for ${summary.date}: ${summary.present}/${summary.total} present, ${summary.absent} absent, ${summary.late} late arrivals.`
    });
  }

  /**
   * Send room inspection notification
   */
  async sendRoomInspectionNotification(
    studentIds: string[],
    roomNumber: string,
    inspectionDate: string
  ): Promise<NotificationApiResponse> {
    return this.sendToUsers({
      userIds: studentIds,
      title: 'Room Inspection Scheduled',
      message: `Room ${roomNumber} inspection scheduled for ${inspectionDate}. Please ensure your room is clean and organized.`
    });
  }

  /**
   * Send hostel announcement
   */
  async sendHostelAnnouncement(
    userIds: string[],
    title: string,
    message: string
  ): Promise<NotificationApiResponse> {
    return this.broadcastNotification({
      title,
      message,
      userIds
    });
  }
}

export const notificationApiService = new NotificationApiService();