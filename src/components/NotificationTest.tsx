import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Send, Users, Bell } from 'lucide-react';

export const NotificationTest: React.FC = () => {
  const {
    sendToUser,
    sendToUsers,
    broadcastNotification,
    sendAttendanceNotification,
    sendLateArrivalNotification,
    sendAbsenceNotification,
    showSuccess,
    showError,
    isLoading,
    error
  } = useNotifications();

  const [formData, setFormData] = useState({
    userId: '',
    userIds: '',
    title: '',
    message: '',
    studentName: '',
    lateMinutes: 15
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendToUser = async () => {
    if (!formData.userId || !formData.title || !formData.message) {
      await showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await sendToUser(formData.userId, formData.title, formData.message);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleSendToUsers = async () => {
    if (!formData.userIds || !formData.title || !formData.message) {
      await showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    const userIds = formData.userIds.split(',').map(id => id.trim()).filter(id => id);
    if (userIds.length === 0) {
      await showError('Validation Error', 'Please provide valid user IDs');
      return;
    }

    try {
      await sendToUsers(userIds, formData.title, formData.message);
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  const handleBroadcast = async () => {
    if (!formData.userIds || !formData.title || !formData.message) {
      await showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    const userIds = formData.userIds.split(',').map(id => id.trim()).filter(id => id);
    if (userIds.length === 0) {
      await showError('Validation Error', 'Please provide valid user IDs');
      return;
    }

    try {
      await broadcastNotification(userIds, formData.title, formData.message);
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
    }
  };

  const handleAttendanceNotification = async () => {
    if (!formData.userId || !formData.title || !formData.message) {
      await showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await sendAttendanceNotification(formData.userId, formData.title, formData.message);
    } catch (error) {
      console.error('Failed to send attendance notification:', error);
    }
  };

  const handleLateArrivalNotification = async () => {
    if (!formData.userId || !formData.studentName) {
      await showError('Validation Error', 'Please provide user ID and student name');
      return;
    }

    try {
      await sendLateArrivalNotification(formData.userId, formData.studentName, formData.lateMinutes);
    } catch (error) {
      console.error('Failed to send late arrival notification:', error);
    }
  };

  const handleAbsenceNotification = async () => {
    if (!formData.userId || !formData.studentName) {
      await showError('Validation Error', 'Please provide user ID and student name');
      return;
    }

    try {
      await sendAbsenceNotification(formData.userId, formData.studentName);
    } catch (error) {
      console.error('Failed to send absence notification:', error);
    }
  };

  const testLocalNotifications = async () => {
    await showSuccess('Test Success', 'This is a success notification');
    setTimeout(async () => {
      await showError('Test Error', 'This is an error notification');
    }, 1000);
    setTimeout(async () => {
      await showSuccess('Test Complete', 'Local notification test completed');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Test
          </CardTitle>
          <CardDescription>
            Test the integrated notification system with external microservice API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <Input
                placeholder="Enter user ID"
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Multiple User IDs (comma-separated)</label>
              <Input
                placeholder="user1,user2,user3"
                value={formData.userIds}
                onChange={(e) => handleInputChange('userIds', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <Textarea
              placeholder="Notification message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name (for attendance)</label>
              <Input
                placeholder="Student name"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Late Minutes</label>
              <Input
                type="number"
                placeholder="15"
                value={formData.lateMinutes}
                onChange={(e) => handleInputChange('lateMinutes', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSendToUser}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to User
            </Button>

            <Button
              onClick={handleSendToUsers}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Send to Users
            </Button>

            <Button
              onClick={handleBroadcast}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Broadcast
            </Button>

            <Button
              onClick={handleAttendanceNotification}
              disabled={isLoading}
              variant="secondary"
            >
              Attendance Alert
            </Button>

            <Button
              onClick={handleLateArrivalNotification}
              disabled={isLoading}
              variant="secondary"
            >
              Late Arrival
            </Button>

            <Button
              onClick={handleAbsenceNotification}
              disabled={isLoading}
              variant="secondary"
            >
              Absence Alert
            </Button>

            <Button
              onClick={testLocalNotifications}
              variant="outline"
            >
              Test Local Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};