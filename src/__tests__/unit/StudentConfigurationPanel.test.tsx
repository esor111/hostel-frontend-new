import { describe, it, expect } from 'vitest';
import { Student, GuardianInfo } from '../../types/api';

describe('StudentConfigurationPanel Types', () => {
  it('should have correct GuardianInfo interface', () => {
    const guardianInfo: GuardianInfo = {
      name: 'John Doe',
      phone: '1234567890',
      relation: 'Father'
    };

    expect(guardianInfo.name).toBe('John Doe');
    expect(guardianInfo.phone).toBe('1234567890');
    expect(guardianInfo.relation).toBe('Father');
  });

  it('should have Student interface with guardian and academic fields', () => {
    const student: Student = {
      id: 'test-id',
      name: 'Jane Doe',
      phone: '0987654321',
      email: 'jane@example.com',
      status: 'Active',
      joinDate: '2024-01-01',
      guardian: {
        name: 'John Doe',
        phone: '1234567890',
        relation: 'Father'
      },
      course: 'B.Tech Computer Science',
      institution: 'ABC University'
    };

    expect(student.guardian?.name).toBe('John Doe');
    expect(student.guardian?.phone).toBe('1234567890');
    expect(student.guardian?.relation).toBe('Father');
    expect(student.course).toBe('B.Tech Computer Science');
    expect(student.institution).toBe('ABC University');
  });

  it('should validate guardian phone number format', () => {
    const validPhoneNumbers = ['1234567890', '9876543210'];
    const invalidPhoneNumbers = ['123', '12345678901', 'abcdefghij'];

    validPhoneNumbers.forEach(phone => {
      const isValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));
      expect(isValid).toBe(true);
    });

    invalidPhoneNumbers.forEach(phone => {
      const isValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));
      expect(isValid).toBe(false);
    });
  });

  it('should have valid relation options', () => {
    const validRelations = [
      'Father', 'Mother', 'Brother', 'Sister', 
      'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 
      'Cousin', 'Other'
    ];

    validRelations.forEach(relation => {
      expect(typeof relation).toBe('string');
      expect(relation.length).toBeGreaterThan(0);
    });
  });
});