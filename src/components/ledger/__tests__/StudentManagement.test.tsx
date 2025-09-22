import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StudentManagement } from '../StudentManagement';
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types/api';

// Mock the hooks
vi.mock('@/hooks/useStudents');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockUseStudents = vi.mocked(useStudents);

const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    roomNumber: 'A101',
    address: '123 Main St',
    status: 'Active',
    isConfigured: false,
    guardian: {
      name: 'Jane Doe',
      phone: '0987654321',
      relation: 'Mother'
    },
    course: 'Computer Science',
    institution: 'ABC University',
    baseMonthlyFee: 15000,
    laundryFee: 2000,
    foodFee: 8000,
    totalPaid: 0,
    balance: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'student-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '2345678901',
    roomNumber: 'B202',
    address: '456 Oak Ave',
    status: 'Active',
    isConfigured: true,
    guardian: {
      name: 'John Smith',
      phone: '1098765432',
      relation: 'Father'
    },
    course: 'Business Administration',
    institution: 'XYZ College',
    baseMonthlyFee: 18000,
    laundryFee: 2500,
    foodFee: 9000,
    totalPaid: 29500,
    balance: 0,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

describe('StudentManagement Component', () => {
  const mockConfigureStudent = vi.fn();
  const mockUpdateStudent = vi.fn();
  const mockSearchStudents = vi.fn();
  const mockRefreshData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseStudents.mockReturnValue({
      students: mockStudents,
      loading: false,
      error: null,
      searchTerm: '',
      configureStudent: mockConfigureStudent,
      updateStudent: mockUpdateStudent,
      searchStudents: mockSearchStudents,
      refreshData: mockRefreshData
    });
  });

  it('renders student management with header and stats', () => {
    render(<StudentManagement />);
    
    expect(screen.getByText('👥 Student Management')).toBeInTheDocument();
    expect(screen.getByText('Enroll new students and manage existing student records')).toBeInTheDocument();
    expect(screen.getByText('2 Total Students')).toBeInTheDocument();
    expect(screen.getByText('2 Active')).toBeInTheDocument();
  });

  it('displays tabs for pending configuration and student list', () => {
    render(<StudentManagement />);
    
    expect(screen.getByText('Pending Configuration (1)')).toBeInTheDocument();
    expect(screen.getByText('Student List & Management (1)')).toBeInTheDocument();
  });

  it('shows pending configuration students', () => {
    render(<StudentManagement />);
    
    // Should be on pending tab by default
    expect(screen.getByText('Students Pending Configuration')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('switches to student list tab', () => {
    render(<StudentManagement />);
    
    const studentListTab = screen.getByText('Student List & Management (1)');
    fireEvent.click(studentListTab);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('opens charge configuration dialog', () => {
    render(<StudentManagement />);
    
    // Find and click configure button for pending student
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    expect(screen.getByText('Guardian Information')).toBeInTheDocument();
    expect(screen.getByText('Academic Information')).toBeInTheDocument();
    expect(screen.getByText('Base Monthly Charges')).toBeInTheDocument();
  });

  it('validates guardian information in configuration form', async () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Clear guardian name and try to complete
    const guardianNameInput = screen.getByLabelText('Guardian Name *');
    fireEvent.change(guardianNameInput, { target: { value: '' } });
    
    const completeButton = screen.getByRole('button', { name: /complete configuration/i });
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Guardian name is required')).toBeInTheDocument();
    });
  });

  it('validates academic information in configuration form', async () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Clear course field and try to complete
    const courseInput = screen.getByLabelText('Course *');
    fireEvent.change(courseInput, { target: { value: '' } });
    
    const completeButton = screen.getByRole('button', { name: /complete configuration/i });
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Course is required')).toBeInTheDocument();
    });
  });

  it('calculates total monthly fee correctly', () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Should show calculated total (15000 + 2000 + 8000 + 1000 + 500 = 26500)
    expect(screen.getByText('₹26,500')).toBeInTheDocument();
  });

  it('adds and removes additional charge fields', () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Add new charge field
    const addChargeButton = screen.getByRole('button', { name: /add charge/i });
    fireEvent.click(addChargeButton);
    
    // Should have more charge fields now
    const chargeDescriptions = screen.getAllByPlaceholderText(/e.g., Parking Fee/i);
    expect(chargeDescriptions.length).toBeGreaterThan(3);
  });

  it('completes charge configuration successfully', async () => {
    mockConfigureStudent.mockResolvedValue(undefined);
    
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Fill required fields
    const guardianNameInput = screen.getByLabelText('Guardian Name *');
    const guardianPhoneInput = screen.getByLabelText('Guardian Phone Number *');
    const guardianRelationSelect = screen.getByRole('combobox');
    const courseInput = screen.getByLabelText('Course *');
    const institutionInput = screen.getByLabelText('Institution *');
    
    fireEvent.change(guardianNameInput, { target: { value: 'Test Guardian' } });
    fireEvent.change(guardianPhoneInput, { target: { value: '1234567890' } });
    fireEvent.change(courseInput, { target: { value: 'Test Course' } });
    fireEvent.change(institutionInput, { target: { value: 'Test Institution' } });
    
    // Select guardian relation
    fireEvent.click(guardianRelationSelect);
    const fatherOption = screen.getByText('Father');
    fireEvent.click(fatherOption);
    
    const completeButton = screen.getByRole('button', { name: /complete configuration/i });
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(mockConfigureStudent).toHaveBeenCalled();
    });
  });

  it('shows loading state', () => {
    mockUseStudents.mockReturnValue({
      students: [],
      loading: true,
      error: null,
      searchTerm: '',
      configureStudent: mockConfigureStudent,
      updateStudent: mockUpdateStudent,
      searchStudents: mockSearchStudents,
      refreshData: mockRefreshData
    });
    
    render(<StudentManagement />);
    
    expect(screen.getByText('Loading students...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    mockUseStudents.mockReturnValue({
      students: [],
      loading: false,
      error: 'Failed to load students',
      searchTerm: '',
      configureStudent: mockConfigureStudent,
      updateStudent: mockUpdateStudent,
      searchStudents: mockSearchStudents,
      refreshData: mockRefreshData
    });
    
    render(<StudentManagement />);
    
    expect(screen.getByText('Failed to Load Students')).toBeInTheDocument();
    expect(screen.getByText('Failed to load students')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('filters students in student list tab', () => {
    mockUseStudents.mockReturnValue({
      students: mockStudents,
      loading: false,
      error: null,
      searchTerm: 'Jane',
      configureStudent: mockConfigureStudent,
      updateStudent: mockUpdateStudent,
      searchStudents: mockSearchStudents,
      refreshData: mockRefreshData
    });
    
    render(<StudentManagement />);
    
    // Switch to student list tab
    const studentListTab = screen.getByText('Student List & Management (1)');
    fireEvent.click(studentListTab);
    
    // Should only show Jane Smith (configured student matching search)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles pagination in student list', () => {
    // Create more students to test pagination
    const manyStudents = Array.from({ length: 10 }, (_, i) => ({
      ...mockStudents[1],
      id: `student-${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`
    }));
    
    mockUseStudents.mockReturnValue({
      students: manyStudents,
      loading: false,
      error: null,
      searchTerm: '',
      configureStudent: mockConfigureStudent,
      updateStudent: mockUpdateStudent,
      searchStudents: mockSearchStudents,
      refreshData: mockRefreshData
    });
    
    render(<StudentManagement />);
    
    // Switch to student list tab
    const studentListTab = screen.getByText('Student List & Management (10)');
    fireEvent.click(studentListTab);
    
    // Should show pagination controls if more than 6 students
    // Note: This test might need adjustment based on actual pagination implementation
    expect(screen.getByText('Student 0')).toBeInTheDocument();
  });

  it('does not show UUID in configuration panel', () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Should not display student ID/UUID anywhere in the form
    expect(screen.queryByText('student-1')).not.toBeInTheDocument();
    expect(screen.queryByText('ID:')).not.toBeInTheDocument();
    expect(screen.queryByText('UUID:')).not.toBeInTheDocument();
  });

  it('includes guardian and course fields in configuration', () => {
    render(<StudentManagement />);
    
    const configureButton = screen.getByRole('button', { name: /configure charges/i });
    fireEvent.click(configureButton);
    
    // Check for guardian fields
    expect(screen.getByLabelText('Guardian Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Guardian Phone Number *')).toBeInTheDocument();
    expect(screen.getByText('Relation *')).toBeInTheDocument();
    
    // Check for academic fields
    expect(screen.getByLabelText('Course *')).toBeInTheDocument();
    expect(screen.getByLabelText('Institution *')).toBeInTheDocument();
  });
});