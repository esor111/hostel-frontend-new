
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { studentService } from '@/services/studentService';
import { bookingApiService } from '@/services/bookingApiService';
import { ledgerService } from '@/services/ledgerService';
import { invoiceService } from '@/services/invoiceService';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  baseMonthlyFee: number;
  laundryFee: number;
  foodFee: number;
  enrollmentDate: string;
  status: 'Active' | 'Inactive';
  currentBalance: number;
  advanceBalance: number;
  emergencyContact: string;
  course: string;
  institution: string;
  isCheckedOut?: boolean;
  checkoutDate?: string;
  totalPaid?: number;
  totalDue?: number;
}

interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  preferredRoom: string;
  course: string;
  institution: string;
  requestDate: string;
  checkInDate: string;
  duration: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  emergencyContact: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
}

interface Invoice {
  id: string;
  studentId: string;
  month: string;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  dueDate: string;
}

interface AppState {
  students: Student[];
  bookingRequests: BookingRequest[];
  invoices: Invoice[];
  loading: boolean;
  lastUpdate: number;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_BOOKING_REQUESTS'; payload: BookingRequest[] }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_BOOKING_STATUS'; payload: { id: string; status: string } }
  | { type: 'REFRESH_DATA' };

const initialState: AppState = {
  students: [],
  bookingRequests: [],
  invoices: [],
  loading: true,
  lastUpdate: Date.now()
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_BOOKING_REQUESTS':
      return { ...state, bookingRequests: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_BOOKING_STATUS':
      return {
        ...state,
        bookingRequests: state.bookingRequests.map(req =>
          req.id === action.payload.id 
            ? { ...req, status: action.payload.status as any }
            : req
        )
      };
    case 'REFRESH_DATA':
      return { ...state, lastUpdate: Date.now() };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshAllData: () => Promise<void>;
  approveBooking: (bookingId: string, roomAssignment: string) => Promise<boolean>;
  getStudentById: (id: string) => Student | undefined;
  getStudentInvoices: (studentId: string) => Invoice[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Emergency fallback - if React hooks are broken, show error UI
  try {
    // Test if React hooks are available by trying to access them
    if (!React || !React.useReducer || !React.useEffect) {
      throw new Error('React hooks not available');
    }

    const [state, dispatch] = React.useReducer(appReducer, initialState);

  const refreshAllData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [students, bookings, invoices] = await Promise.all([
        studentService.getStudents(),
        bookingApiService.getAllBookings(),
        invoiceService.getInvoices()
      ]);
      
      dispatch({ type: 'SET_STUDENTS', payload: students });
      dispatch({ type: 'SET_BOOKING_REQUESTS', payload: bookings });
      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'REFRESH_DATA' });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const approveBooking = async (bookingId: string, roomAssignment: string = ''): Promise<boolean> => {
    try {
      const result = await bookingApiService.approveBooking(bookingId, 'admin');
      if (result && result.success) {
        dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id: bookingId, status: 'Approved' } });
        // Refresh data to get updated bookings and any new students
        await refreshAllData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error approving booking:', error);
      return false;
    }
  };

  const getStudentById = (id: string): Student | undefined => {
    return state.students.find(student => student.id === id);
  };

  const getStudentInvoices = (studentId: string): Invoice[] => {
    return state.invoices.filter(invoice => invoice.studentId === studentId);
  };

    React.useEffect(() => {
      // Add error boundary for useEffect
      try {
        refreshAllData();
      } catch (error) {
        console.error('Error in AppProvider useEffect:', error);
      }
    }, []);

    const contextValue: AppContextType = {
      state,
      dispatch,
      refreshAllData,
      approveBooking,
      getStudentById,
      getStudentInvoices
    };

    return (
      <AppContext.Provider value={contextValue}>
        {children}
      </AppContext.Provider>
    );

  } catch (error) {
    console.error('React hooks are broken:', error);
    
    // Return fallback UI when React hooks fail
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">React Hooks Error</h2>
          <p className="text-gray-600 mb-4">
            React hooks are not working properly. This usually indicates:
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2 mb-4">
            <li>• Multiple React instances loaded</li>
            <li>• React version mismatch</li>
            <li>• Corrupted node_modules</li>
          </ul>
          <div className="bg-gray-100 p-3 rounded text-xs text-left">
            <strong>Quick fixes:</strong><br/>
            1. Clear browser cache (Ctrl+Shift+R)<br/>
            2. Stop server and run: npm run clean<br/>
            3. Then run: npm install<br/>
            4. Restart: npm run dev
          </div>
        </div>
      </div>
    );
  }

}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
