import { http, HttpResponse } from 'msw';
import { 
  mockStudents, 
  mockDashboardStats, 
  mockActivities, 
  mockPayments, 
  mockRooms, 
  mockBookingRequests,
  generateMockStudent,
  generateMockPayment,
  filterStudents,
  paginateResults
} from './mockData';
import { Student, CreateStudentDto, UpdateStudentDto, CreatePaymentDto } from '../../types/api';

const BASE_URL = 'http://localhost:3001/hostel/api/v1';

// In-memory storage for tests
let studentsData = [...mockStudents];
let paymentsData = [...mockPayments];
let bookingRequestsData = [...mockBookingRequests];

export const handlers = [
  // Health check endpoint
  http.get(`${BASE_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Students endpoints - specific routes first
  http.get(`${BASE_URL}/students/stats`, () => {
    const stats = {
      total: studentsData.length,
      active: studentsData.filter(s => s.status === 'Active').length,
      inactive: studentsData.filter(s => s.status === 'Inactive').length,
      totalDues: studentsData.reduce((sum, s) => sum + Math.min(0, s.balance || 0), 0),
      totalAdvances: studentsData.reduce((sum, s) => sum + Math.max(0, s.balance || 0), 0)
    };
    
    return HttpResponse.json({ data: stats });
  }),

  http.get(`${BASE_URL}/students`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const roomNumber = url.searchParams.get('roomNumber') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const filters = { search, status, roomNumber };
    const filteredStudents = filterStudents(studentsData, filters);
    const paginatedResult = paginateResults(filteredStudents, page, limit);

    return HttpResponse.json({
      data: paginatedResult.items,
      meta: {
        total: paginatedResult.total,
        page: paginatedResult.page,
        limit: paginatedResult.limit,
        totalPages: paginatedResult.totalPages
      }
    });
  }),

  http.get(`${BASE_URL}/students/:id`, ({ params }) => {
    const { id } = params;
    const student = studentsData.find(s => s.id === id);
    
    if (!student) {
      return HttpResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: student });
  }),

  http.post(`${BASE_URL}/students`, async ({ request }) => {
    const studentData = await request.json() as CreateStudentDto;
    const newStudent = generateMockStudent({
      ...studentData,
      id: Date.now().toString()
    });
    
    studentsData.push(newStudent);
    return HttpResponse.json({ data: newStudent }, { status: 201 });
  }),

  http.put(`${BASE_URL}/students/:id`, async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as UpdateStudentDto;
    
    const studentIndex = studentsData.findIndex(s => s.id === id);
    if (studentIndex === -1) {
      return HttpResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    studentsData[studentIndex] = { ...studentsData[studentIndex], ...updateData };
    return HttpResponse.json({ data: studentsData[studentIndex] });
  }),

  http.delete(`${BASE_URL}/students/:id`, ({ params }) => {
    const { id } = params;
    const studentIndex = studentsData.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return HttpResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    studentsData.splice(studentIndex, 1);
    return HttpResponse.json({ message: 'Student deleted successfully' });
  }),

  // Dashboard endpoints
  http.get(`${BASE_URL}/dashboard/stats`, () => {
    return HttpResponse.json({ stats: mockDashboardStats });
  }),

  http.get(`${BASE_URL}/dashboard/recent-activity`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({ 
      data: mockActivities.slice(0, limit) 
    });
  }),

  http.get(`${BASE_URL}/dashboard/monthly-revenue`, ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    
    // Mock revenue data based on parameters
    const revenueData = {
      month: month ? `${year}-${month.padStart(2, '0')}` : '2024-08',
      revenue: 2500000,
      collections: 2200000,
      pending: 300000
    };
    
    return HttpResponse.json({ data: revenueData });
  }),

  // Payments endpoints
  http.get(`${BASE_URL}/payments`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredPayments = [...paymentsData];
    if (studentId) {
      filteredPayments = filteredPayments.filter(p => p.studentId === studentId);
    }

    const paginatedResult = paginateResults(filteredPayments, page, limit);
    return HttpResponse.json({
      data: paginatedResult.items,
      meta: {
        total: paginatedResult.total,
        page: paginatedResult.page,
        limit: paginatedResult.limit,
        totalPages: paginatedResult.totalPages
      }
    });
  }),

  http.post(`${BASE_URL}/payments`, async ({ request }) => {
    const paymentData = await request.json() as CreatePaymentDto;
    const newPayment = generateMockPayment({
      ...paymentData,
      id: Date.now().toString()
    });
    
    paymentsData.push(newPayment);
    return HttpResponse.json({ data: newPayment }, { status: 201 });
  }),

  http.get(`${BASE_URL}/payments/stats`, () => {
    const stats = {
      total: paymentsData.length,
      totalAmount: paymentsData.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: paymentsData.filter(p => p.status === 'Completed').length,
      pendingPayments: paymentsData.filter(p => p.status === 'Pending').length
    };
    
    return HttpResponse.json({ stats });
  }),

  // Rooms endpoints
  http.get(`${BASE_URL}/rooms`, () => {
    return HttpResponse.json({ data: mockRooms });
  }),

  http.get(`${BASE_URL}/rooms/:id`, ({ params }) => {
    const { id } = params;
    const room = mockRooms.find(r => r.id === id);
    
    if (!room) {
      return HttpResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: room });
  }),

  // Booking requests endpoints
  http.get(`${BASE_URL}/bookings`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let filteredBookings = [...bookingRequestsData];
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }

    return HttpResponse.json({ data: filteredBookings });
  }),

  http.post(`${BASE_URL}/bookings/:id/approve`, ({ params }) => {
    const { id } = params;
    const bookingIndex = bookingRequestsData.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return HttpResponse.json(
        { message: 'Booking request not found' },
        { status: 404 }
      );
    }

    bookingRequestsData[bookingIndex].status = 'Approved';
    return HttpResponse.json({ 
      data: bookingRequestsData[bookingIndex],
      message: 'Booking approved successfully'
    });
  }),

  http.post(`${BASE_URL}/bookings/:id/reject`, ({ params }) => {
    const { id } = params;
    const bookingIndex = bookingRequestsData.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return HttpResponse.json(
        { message: 'Booking request not found' },
        { status: 404 }
      );
    }

    bookingRequestsData[bookingIndex].status = 'Rejected';
    return HttpResponse.json({ 
      data: bookingRequestsData[bookingIndex],
      message: 'Booking rejected successfully'
    });
  }),

  // Ledger endpoints
  http.get(`${BASE_URL}/ledger`, () => {
    // Mock ledger entries
    const ledgerEntries = [
      {
        id: '1',
        studentId: '1',
        date: '2024-08-28',
        type: 'Payment',
        description: 'Monthly fee payment',
        debit: 0,
        credit: 15000,
        balance: -2500,
        balanceType: 'Dr'
      }
    ];
    
    return HttpResponse.json({ data: ledgerEntries });
  }),

  http.get(`${BASE_URL}/ledger/student/:studentId`, ({ params }) => {
    const { studentId } = params;
    // Mock student-specific ledger
    const ledgerEntries = [
      {
        id: '1',
        studentId,
        date: '2024-08-28',
        type: 'Payment',
        description: 'Monthly fee payment',
        debit: 0,
        credit: 15000,
        balance: -2500,
        balanceType: 'Dr'
      }
    ];
    
    return HttpResponse.json({ data: ledgerEntries });
  }),

  // Analytics endpoints
  http.get(`${BASE_URL}/analytics/revenue`, () => {
    const revenueData = {
      monthly: [2200000, 2300000, 2500000, 2400000, 2600000, 2500000],
      labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    };
    
    return HttpResponse.json({ data: revenueData });
  }),

  http.get(`${BASE_URL}/analytics/occupancy`, () => {
    const occupancyData = {
      rate: 85,
      trend: [80, 82, 85, 87, 85, 88]
    };
    
    return HttpResponse.json({ data: occupancyData });
  }),

  // Admin charges endpoints
  http.get(`${BASE_URL}/admin/charges`, () => {
    const charges = [
      {
        id: '1',
        name: 'Late Fee',
        amount: 500,
        type: 'Fixed',
        description: 'Late payment penalty'
      },
      {
        id: '2',
        name: 'Maintenance Fee',
        amount: 1000,
        type: 'Monthly',
        description: 'Room maintenance charge'
      }
    ];
    
    return HttpResponse.json({ data: charges });
  }),

  // Notifications endpoints
  http.get(`${BASE_URL}/notifications`, () => {
    const notifications = [
      {
        id: '1',
        title: 'Payment Reminder',
        message: 'Monthly fee payment is due',
        type: 'payment',
        read: false,
        createdAt: '2024-08-28T10:00:00Z'
      }
    ];
    
    return HttpResponse.json({ data: notifications });
  }),

  // Test error endpoint for error handling tests
  http.get(`${BASE_URL}/test/error`, () => {
    return HttpResponse.json(
      { message: 'Test error for testing error handling' },
      { status: 500 }
    );
  })
];

// Helper function to reset mock data (useful for tests)
export const resetMockData = () => {
  studentsData = [...mockStudents];
  paymentsData = [...mockPayments];
  bookingRequestsData = [...mockBookingRequests];
};