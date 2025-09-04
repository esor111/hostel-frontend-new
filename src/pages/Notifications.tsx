import { useState } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/contexts/SafeAppContext';
import {
    Bell,
    Send,
    MessageSquare,
    Users,
    Clock,
    User
} from 'lucide-react';
import { toast } from 'sonner';

// User Selection Panel Component
interface UserSelectionPanelProps {
    students: any[];
    selectedUsers: string[];
    onSelectionChange: (users: string[]) => void;
}

const UserSelectionPanel = ({ students, selectedUsers, onSelectionChange }: UserSelectionPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedUsers.length === students.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(students.map(s => s.id));
        }
    };

    const handleUserToggle = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            onSelectionChange(selectedUsers.filter(id => id !== userId));
        } else {
            onSelectionChange([...selectedUsers, userId]);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Recipients ({selectedUsers.length})
                </CardTitle>
                <div className="space-y-3">
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                    />
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedUsers.length === students.length}
                            onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium">
                            Select All ({students.length})
                        </label>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-96">
                    <div className="space-y-2">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                <Checkbox
                                    id={student.id}
                                    checked={selectedUsers.includes(student.id)}
                                    onCheckedChange={() => handleUserToggle(student.id)}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Room {student.roomNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredStudents.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No students found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

// Recent Notifications List Component
interface RecentNotificationsListProps {
    notifications: any[];
    onRefresh: () => void;
}

const RecentNotificationsList = ({ notifications, onRefresh }: RecentNotificationsListProps) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recently Sent Notifications
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <Bell className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="space-y-3">
                        {notifications.map(notification => (
                            <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                                    <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(notification.sentAt).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {notification.recipients.length} recipients
                                        </span>
                                    </div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                                    {notification.deliveryRate}% Delivered
                                </Badge>
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No recent notifications</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

const Notifications = () => {
    const { state } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

    // Mock notification data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: 'Your monthly payment is due tomorrow. Please make payment to avoid late fees.',
            recipients: ['Ram Sharma', 'Hari Thapa'],
            sentAt: '2024-01-15T10:30:00Z',
            status: 'sent',
            deliveryRate: 100
        },
        {
            id: 2,
            type: 'welcome',
            title: 'Welcome to Kaha Hostel',
            message: 'Welcome to Kaha Hostel! We hope you have a comfortable stay with us.',
            recipients: ['Sita Poudel'],
            sentAt: '2024-01-15T09:15:00Z',
            status: 'sent',
            deliveryRate: 100
        },
        {
            id: 3,
            type: 'maintenance',
            title: 'Maintenance Notice',
            message: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance.',
            recipients: ['All Students'],
            sentAt: '2024-01-14T16:45:00Z',
            status: 'sent',
            deliveryRate: 95
        }
    ]);

    // Calculate today's stats
    const today = new Date().toDateString();
    const todayNotifications = notifications.filter(n =>
        new Date(n.sentAt).toDateString() === today
    );
    const totalSentToday = todayNotifications.reduce((sum, n) =>
        sum + (n.recipients.includes('All Students') ? state.students?.length || 0 : n.recipients.length), 0
    );

    // Filter out pass out students (only show active students)
    const activeStudents = state.students?.filter(s => !s.isCheckedOut) || [];

    const handleSendNotification = () => {
        if (!newMessage.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (selectedRecipients.length === 0) {
            toast.error('Please select recipients');
            return;
        }

        // Mock sending notification
        const selectedStudents = activeStudents.filter(s => selectedRecipients.includes(s.id));
        const newNotification = {
            id: Date.now(),
            type: 'custom',
            title: 'Custom Notification',
            message: newMessage,
            recipients: selectedStudents.map(s => s.name),
            sentAt: new Date().toISOString(),
            status: 'sent',
            deliveryRate: 100
        };

        // Add to notifications list
        setNotifications(prev => [newNotification, ...prev]);
        
        toast.success(`Notification sent to ${selectedRecipients.length} recipients`);
        setNewMessage('');
        setSelectedRecipients([]);
    };

    const handleRefreshNotifications = () => {
        // Mock refresh - in real app this would fetch from API
        toast.success('Notifications refreshed');
    };

    return (
        <MainLayout activeTab="notifications">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[#231F20]">🔔 Notification Center</h1>
                        <p className="text-gray-600 mt-1">Manage and send notifications to students</p>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Notifications Sent Today</p>
                                    <p className="text-3xl font-bold text-blue-600">{totalSentToday}</p>
                                    <p className="text-xs text-blue-600 mt-1">Total composed and sent</p>
                                </div>
                                <Send className="h-12 w-12 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Active Students</p>
                                    <p className="text-3xl font-bold text-green-600">{activeStudents.length}</p>
                                    <p className="text-xs text-green-600 mt-1">Available for notifications</p>
                                </div>
                                <Users className="h-12 w-12 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Total Notifications</p>
                                    <p className="text-3xl font-bold text-purple-600">{notifications.length}</p>
                                    <p className="text-xs text-purple-600 mt-1">All time sent</p>
                                </div>
                                <Bell className="h-12 w-12 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area with Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Compose Notification */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Compose New Notification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Message
                                    </label>
                                    <Textarea
                                        placeholder="Type your notification message here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={6}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        {selectedRecipients.length > 0 ? (
                                            <span className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No recipients selected</span>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleSendNotification}
                                        className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#06954A] hover:to-[#1185C0]"
                                        disabled={!newMessage.trim() || selectedRecipients.length === 0}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Notification
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - User Selection Panel */}
                    <div className="lg:col-span-1">
                        <UserSelectionPanel
                            students={activeStudents}
                            selectedUsers={selectedRecipients}
                            onSelectionChange={setSelectedRecipients}
                        />
                    </div>
                </div>

                {/* Recent Notifications */}
                <RecentNotificationsList
                    notifications={notifications}
                    onRefresh={handleRefreshNotifications}
                />
            </div>
        </MainLayout>
    );
};

export default Notifications;