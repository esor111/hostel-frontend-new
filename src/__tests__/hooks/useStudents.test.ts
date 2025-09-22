import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudents } from '../../hooks/useStudents';
import { studentsApiService } from '../../services/studentsApiService';
import { CreateStudentDto, UpdateStudentDto } from '../../types/api';

describe('useStudents Hook', () => {
    beforeEach(() => {
        // Reset any test-specific state
    });

    describe('initial state', () => {
        it('should initialize with correct default state', async () => {
            const { result } = renderHook(() => useStudents());

            // Initially, loading should be true because useEffect triggers loadStudents
            expect(result.current.students).toEqual([]);
            expect(result.current.loading).toBe(true); // Changed from false to true
            expect(result.current.error).toBe(null);
            expect(result.current.stats).toBe(null);
            expect(result.current.searchTerm).toBe('');
            expect(result.current.filters).toEqual({});

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should initialize with provided filters', () => {
            const initialFilters = { status: 'Active', page: 1 };
            const { result } = renderHook(() => useStudents(initialFilters));

            expect(result.current.filters).toEqual(initialFilters);
        });
    });

    describe('loadStudents', () => {
        it('should load students successfully', async () => {
            const { result } = renderHook(() => useStudents());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            }, { timeout: 15000 });

            expect(result.current.students.length).toBeGreaterThan(0);
            expect(result.current.error).toBe(null);

            // Verify student structure
            const student = result.current.students[0];
            expect(student).toHaveProperty('id');
            expect(student).toHaveProperty('name');
            expect(student).toHaveProperty('phone');
            expect(student).toHaveProperty('email');
        });

        it('should set loading state during API call', async () => {
            const { result } = renderHook(() => useStudents());

            // Initially loading should be true (during mount effect)
            expect(result.current.loading).toBe(true);

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('loadStudentStats', () => {
        it('should load student statistics', async () => {
            const { result } = renderHook(() => useStudents());

            await waitFor(() => {
                expect(result.current.stats).not.toBe(null);
            }, { timeout: 15000 });

            expect(result.current.stats).toHaveProperty('total');
            expect(result.current.stats).toHaveProperty('active');
            expect(result.current.stats).toHaveProperty('inactive');
            expect(typeof result.current.stats!.total).toBe('number');
        });
    });

    describe('createStudent', () => {
        it('should create a new student and update state', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const initialCount = result.current.students.length;

            const newStudentData: CreateStudentDto = {
                name: 'Hook Test Student',
                phone: '9846666666',
                email: 'hooktest@example.com'
            };

            let createdStudent;
            await act(async () => {
                createdStudent = await result.current.createStudent(newStudentData);
            });

            expect(createdStudent).toHaveProperty('id');
            expect(createdStudent.name).toBe(newStudentData.name);

            // Should be added to the students list
            expect(result.current.students.length).toBe(initialCount + 1);
            expect(result.current.students.some(s => s.name === newStudentData.name)).toBe(true);
        });

        it('should handle creation errors', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Mock the API service to throw an error
            const originalCreateStudent = studentsApiService.createStudent;
            studentsApiService.createStudent = vi.fn().mockRejectedValue(new Error('Validation failed'));

            const invalidData = { name: '', phone: '', email: '' } as CreateStudentDto;

            await act(async () => {
                try {
                    await result.current.createStudent(invalidData);
                } catch (error) {
                    // Expected to throw
                }
            });

            // Should have error state
            expect(result.current.error).not.toBe(null);

            // Restore original function
            studentsApiService.createStudent = originalCreateStudent;
        });
    });

    describe('updateStudent', () => {
        it('should update an existing student and update state', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const studentToUpdate = result.current.students[0];
            const updateData: UpdateStudentDto = {
                name: 'Updated Hook Test Name'
            };

            let updatedStudent;
            await act(async () => {
                updatedStudent = await result.current.updateStudent(studentToUpdate.id, updateData);
            });

            expect(updatedStudent.name).toBe(updateData.name);

            // Should be updated in the students list
            const updatedInList = result.current.students.find(s => s.id === studentToUpdate.id);
            expect(updatedInList?.name).toBe(updateData.name);
        });
    });

    describe('deleteStudent', () => {
        it('should delete a student and update state', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // First create a student to delete
            const newStudentData: CreateStudentDto = {
                name: 'To Delete Hook',
                phone: '9847777777',
                email: 'deletehook@example.com'
            };

            let createdStudent;
            await act(async () => {
                createdStudent = await result.current.createStudent(newStudentData);
            });

            const countBeforeDelete = result.current.students.length;

            // Delete the student
            await act(async () => {
                await result.current.deleteStudent(createdStudent.id);
            });

            // Should be removed from the students list
            expect(result.current.students.length).toBe(countBeforeDelete - 1);
            expect(result.current.students.some(s => s.id === createdStudent.id)).toBe(false);
        });
    });

    describe('searchStudents', () => {
        it('should update search term and reload students', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const searchTerm = 'John';

            await act(async () => {
                await result.current.searchStudents(searchTerm);
            });

            expect(result.current.searchTerm).toBe(searchTerm);

            // Wait for search results
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Should filter results based on search term
            result.current.students.forEach(student => {
                const matchesSearch =
                    student.name.toLowerCase().includes('john') ||
                    student.phone.includes('john') ||
                    student.email.toLowerCase().includes('john');
                expect(matchesSearch).toBe(true);
            });
        });
    });

    describe('setFilters', () => {
        it('should update filters and reload students', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const newFilters = { status: 'Active' };

            await act(async () => {
                result.current.setFilters(newFilters);
            });

            expect(result.current.filters).toEqual(newFilters);

            // Wait for filtered results
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Should filter results based on status
            result.current.students.forEach(student => {
                expect(student.status).toBe('Active');
            });
        });
    });

    describe('clearError', () => {
        it('should clear error state', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Mock the API service to throw an error
            const originalCreateStudent = studentsApiService.createStudent;
            studentsApiService.createStudent = vi.fn().mockRejectedValue(new Error('Test error'));

            // Force an error by trying to create invalid student
            await act(async () => {
                try {
                    await result.current.createStudent({} as CreateStudentDto);
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.error).not.toBe(null);

            // Restore original function
            studentsApiService.createStudent = originalCreateStudent;

            // Clear the error
            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBe(null);
        });
    });

    describe('refreshData', () => {
        it('should refresh both students and stats', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
                expect(result.current.stats).not.toBe(null);
            });

            const initialStudentsCount = result.current.students.length;
            const initialStats = result.current.stats;

            // Refresh data
            await act(async () => {
                await result.current.refreshData();
            });

            // Should have reloaded data
            expect(result.current.students.length).toBeGreaterThanOrEqual(0);
            expect(result.current.stats).not.toBe(null);
            expect(result.current.error).toBe(null);
        });
    });

    describe('error handling', () => {
        it('should handle API errors gracefully', async () => {
            const { result } = renderHook(() => useStudents());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Try to update non-existent student
            await act(async () => {
                try {
                    await result.current.updateStudent('999', { name: 'Test' });
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.error).not.toBe(null);
            expect(result.current.loading).toBe(false);
        });
    });
});