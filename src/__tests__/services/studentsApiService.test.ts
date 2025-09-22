import { describe, it, expect, beforeEach } from 'vitest';
import { studentsApiService } from '../../services/studentsApiService';
import { Student, CreateStudentDto, UpdateStudentDto } from '../../types/api';

describe('StudentsApiService', () => {
  beforeEach(() => {
    // Reset any test-specific state
  });

  describe('getStudents', () => {
    it('should fetch all students', async () => {
      const students = await studentsApiService.getStudents();
      
      expect(Array.isArray(students)).toBe(true);
      expect(students.length).toBeGreaterThan(0);
      
      // Verify student structure
      const student = students[0];
      expect(student).toHaveProperty('id');
      expect(student).toHaveProperty('name');
      expect(student).toHaveProperty('phone');
      expect(student).toHaveProperty('email');
      expect(student).toHaveProperty('status');
    });

    it('should filter students by search term', async () => {
      const students = await studentsApiService.getStudents({ search: 'John' });
      
      expect(Array.isArray(students)).toBe(true);
      // Should return students matching the search term
      students.forEach(student => {
        const matchesSearch = 
          student.name.toLowerCase().includes('john') ||
          student.phone.includes('john') ||
          student.email.toLowerCase().includes('john');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should filter students by status', async () => {
      const activeStudents = await studentsApiService.getStudents({ status: 'Active' });
      
      expect(Array.isArray(activeStudents)).toBe(true);
      activeStudents.forEach(student => {
        expect(student.status).toBe('Active');
      });
    });

    it('should filter students by room number', async () => {
      const students = await studentsApiService.getStudents({ roomNumber: 'A101' });
      
      expect(Array.isArray(students)).toBe(true);
      students.forEach(student => {
        expect(student.roomNumber).toBe('A101');
      });
    });

    it('should handle pagination', async () => {
      const page1 = await studentsApiService.getStudents({ page: 1, limit: 2 });
      const page2 = await studentsApiService.getStudents({ page: 2, limit: 2 });
      
      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getStudentById', () => {
    it('should fetch a specific student by ID', async () => {
      const student = await studentsApiService.getStudentById('1');
      
      expect(student).toHaveProperty('id', '1');
      expect(student).toHaveProperty('name');
      expect(student).toHaveProperty('phone');
      expect(student).toHaveProperty('email');
    });

    it('should throw error for non-existent student', async () => {
      await expect(studentsApiService.getStudentById('999')).rejects.toThrow('Student not found');
    });
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      const newStudentData: CreateStudentDto = {
        name: 'Test Student',
        phone: '9841111111',
        email: 'test.student@example.com',
        roomNumber: 'T101',
        address: 'Test Address'
      };

      const createdStudent = await studentsApiService.createStudent(newStudentData);
      
      expect(createdStudent).toHaveProperty('id');
      expect(createdStudent.name).toBe(newStudentData.name);
      expect(createdStudent.phone).toBe(newStudentData.phone);
      expect(createdStudent.email).toBe(newStudentData.email);
      expect(createdStudent.roomNumber).toBe(newStudentData.roomNumber);
      expect(createdStudent.status).toBe('Active'); // Default status
    });

    it('should create student with minimal required data', async () => {
      const minimalData: CreateStudentDto = {
        name: 'Minimal Student',
        phone: '9842222222',
        email: 'minimal@example.com'
      };

      const createdStudent = await studentsApiService.createStudent(minimalData);
      
      expect(createdStudent).toHaveProperty('id');
      expect(createdStudent.name).toBe(minimalData.name);
      expect(createdStudent.phone).toBe(minimalData.phone);
      expect(createdStudent.email).toBe(minimalData.email);
    });
  });

  describe('updateStudent', () => {
    it('should update an existing student', async () => {
      const updateData: UpdateStudentDto = {
        name: 'Updated Student Name',
        status: 'Inactive'
      };

      const updatedStudent = await studentsApiService.updateStudent('1', updateData);
      
      expect(updatedStudent.id).toBe('1');
      expect(updatedStudent.name).toBe(updateData.name);
      expect(updatedStudent.status).toBe(updateData.status);
    });

    it('should update only specified fields', async () => {
      const originalStudent = await studentsApiService.getStudentById('1');
      const updateData: UpdateStudentDto = {
        phone: '9843333333'
      };

      const updatedStudent = await studentsApiService.updateStudent('1', updateData);
      
      expect(updatedStudent.id).toBe('1');
      expect(updatedStudent.phone).toBe(updateData.phone);
      expect(updatedStudent.name).toBe(originalStudent.name); // Should remain unchanged
      expect(updatedStudent.email).toBe(originalStudent.email); // Should remain unchanged
    });

    it('should throw error for non-existent student', async () => {
      const updateData: UpdateStudentDto = { name: 'Test' };
      
      await expect(studentsApiService.updateStudent('999', updateData))
        .rejects.toThrow('Student not found');
    });
  });

  describe('deleteStudent', () => {
    it('should delete an existing student', async () => {
      // First create a student to delete
      const newStudent = await studentsApiService.createStudent({
        name: 'To Delete',
        phone: '9844444444',
        email: 'delete@example.com'
      });

      // Delete the student
      await studentsApiService.deleteStudent(newStudent.id);

      // Verify student is deleted
      await expect(studentsApiService.getStudentById(newStudent.id))
        .rejects.toThrow('Student not found');
    });

    it('should throw error for non-existent student', async () => {
      await expect(studentsApiService.deleteStudent('999'))
        .rejects.toThrow('Student not found');
    });
  });

  describe('getStudentStats', () => {
    it('should fetch student statistics', async () => {
      const stats = await studentsApiService.getStudentStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats).toHaveProperty('totalDues');
      expect(stats).toHaveProperty('totalAdvances');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.inactive).toBe('number');
      expect(typeof stats.totalDues).toBe('number');
      expect(typeof stats.totalAdvances).toBe('number');
      
      // Logical checks
      expect(stats.total).toBeGreaterThanOrEqual(stats.active + stats.inactive);
      expect(stats.active).toBeGreaterThanOrEqual(0);
      expect(stats.inactive).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchStudents', () => {
    it('should search students by name', async () => {
      const results = await studentsApiService.searchStudents('John');
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(student => {
        const matchesSearch = 
          student.name.toLowerCase().includes('john') ||
          student.phone.includes('john') ||
          student.email.toLowerCase().includes('john');
        expect(matchesSearch).toBe(true);
      });
    });

    it('should return empty array for non-matching search', async () => {
      const results = await studentsApiService.searchStudents('NonExistentName12345');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getStudentsWithDues', () => {
    it('should return students with negative balance', async () => {
      const studentsWithDues = await studentsApiService.getStudentsWithDues();
      
      expect(Array.isArray(studentsWithDues)).toBe(true);
      studentsWithDues.forEach(student => {
        expect(student.balance || 0).toBeLessThan(0);
      });
    });
  });

  describe('getActiveStudents', () => {
    it('should return only active students', async () => {
      const activeStudents = await studentsApiService.getActiveStudents();
      
      expect(Array.isArray(activeStudents)).toBe(true);
      activeStudents.forEach(student => {
        expect(student.status).toBe('Active');
      });
    });
  });

  describe('getInactiveStudents', () => {
    it('should return only inactive students', async () => {
      const inactiveStudents = await studentsApiService.getInactiveStudents();
      
      expect(Array.isArray(inactiveStudents)).toBe(true);
      inactiveStudents.forEach(student => {
        expect(student.status).toBe('Inactive');
      });
    });
  });

  describe('checkoutStudent', () => {
    it('should checkout a student by updating status', async () => {
      // First create a student to checkout
      const newStudent = await studentsApiService.createStudent({
        name: 'To Checkout',
        phone: '9845555555',
        email: 'checkout@example.com'
      });

      // Checkout the student
      const checkedOutStudent = await studentsApiService.checkoutStudent(newStudent.id, {
        reason: 'Course completed'
      });

      expect(checkedOutStudent.id).toBe(newStudent.id);
      expect(checkedOutStudent.status).toBe('Graduated');
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // This would be tested with a specific MSW handler for network errors
      // For now, we test that errors are properly thrown
      await expect(studentsApiService.getStudentById('invalid-id-format'))
        .rejects.toThrow();
    });
  });
});