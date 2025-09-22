import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subDays, format } from 'date-fns';
import { LedgerEntry } from '@/types/api';

// Mock data for testing
const mockLedgerEntries: LedgerEntry[] = [
  {
    id: '1',
    studentId: 'student1',
    date: subDays(new Date(), 5).toISOString(),
    type: 'Invoice',
    description: 'Monthly rent',
    debit: 1000,
    credit: 0,
    balance: 1000,
    balanceType: 'Outstanding',
    referenceId: 'INV-001',
  },
  {
    id: '2',
    studentId: 'student1',
    date: subDays(new Date(), 3).toISOString(),
    type: 'Payment',
    description: 'Payment received',
    debit: 0,
    credit: 500,
    balance: 500,
    balanceType: 'Outstanding',
    referenceId: 'PAY-001',
  },
  {
    id: '3',
    studentId: 'student1',
    date: subDays(new Date(), 20).toISOString(),
    type: 'Invoice',
    description: 'Previous month rent',
    debit: 1000,
    credit: 0,
    balance: 1000,
    balanceType: 'Outstanding',
    referenceId: 'INV-002',
  },
];

describe('Ledger Filtering Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter entries by date range correctly', () => {
    const fromDate = subDays(new Date(), 10);
    const toDate = new Date();
    
    const filteredEntries = mockLedgerEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= fromDate && entryDate <= toDate;
    });

    expect(filteredEntries).toHaveLength(2);
    expect(filteredEntries.map(e => e.id)).toEqual(['1', '2']);
  });

  it('should filter entries by entry type correctly', () => {
    const filteredEntries = mockLedgerEntries.filter(entry => entry.type === 'Invoice');

    expect(filteredEntries).toHaveLength(2);
    expect(filteredEntries.every(e => e.type === 'Invoice')).toBe(true);
  });

  it('should filter entries by payment type correctly', () => {
    const filteredEntries = mockLedgerEntries.filter(entry => entry.type === 'Payment');

    expect(filteredEntries).toHaveLength(1);
    expect(filteredEntries[0].id).toBe('2');
  });

  it('should calculate filtered totals correctly', () => {
    const filteredEntries = mockLedgerEntries.filter(entry => entry.type === 'Invoice');
    
    const totalDebits = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    expect(totalDebits).toBe(2000);
    expect(totalCredits).toBe(0);
  });

  it('should handle combined filters correctly', () => {
    const fromDate = subDays(new Date(), 10);
    const toDate = new Date();
    
    const filteredEntries = mockLedgerEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const dateMatch = entryDate >= fromDate && entryDate <= toDate;
      const typeMatch = entry.type === 'Invoice';
      return dateMatch && typeMatch;
    });

    expect(filteredEntries).toHaveLength(1);
    expect(filteredEntries[0].id).toBe('1');
  });

  it('should return empty array when no entries match filters', () => {
    const filteredEntries = mockLedgerEntries.filter(entry => entry.type === 'NonExistentType');

    expect(filteredEntries).toHaveLength(0);
  });

  it('should handle preset date filters correctly', () => {
    // Test "last week" preset (7 days)
    const lastWeekDate = subDays(new Date(), 7);
    const filteredEntries = mockLedgerEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= lastWeekDate;
    });

    expect(filteredEntries).toHaveLength(2);
    expect(filteredEntries.map(e => e.id)).toEqual(['1', '2']);
  });
});