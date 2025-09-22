import { describe, it, expect } from 'vitest'
import { billingService } from '../billingService.js'

describe('billingService', () => {
  describe('calculateProratedAmount', () => {
    it('should calculate prorated amount for mid-month enrollment', () => {
      const monthlyAmount = 5000
      const enrollmentDate = '2024-01-15' // Mid-month
      
      const result = billingService.calculateProratedAmount(monthlyAmount, enrollmentDate)

      expect(result).toHaveProperty('totalDaysInMonth')
      expect(result).toHaveProperty('daysToCalculate')
      expect(result).toHaveProperty('proratedAmount')
      expect(result).toHaveProperty('isProrated')
      expect(result.isProrated).toBe(true)
      expect(result.proratedAmount).toBeLessThan(monthlyAmount)
    })

    it('should not prorate for first day of month', () => {
      const monthlyAmount = 5000
      const enrollmentDate = '2024-01-01' // First day
      
      const result = billingService.calculateProratedAmount(monthlyAmount, enrollmentDate)

      expect(result.isProrated).toBe(false)
      expect(result.proratedAmount).toBe(monthlyAmount)
    })
  })

  describe('generateInitialInvoice', () => {
    it('should generate initial invoice for new student', async () => {
      const student = {
        id: 'STU001',
        name: 'Test Student',
        enrollmentDate: '2024-01-15',
        baseMonthlyFee: 5000,
        laundryFee: 500,
        foodFee: 3000
      }
      
      const invoice = await billingService.generateInitialInvoice(student)

      expect(invoice).toHaveProperty('id')
      expect(invoice).toHaveProperty('studentId', student.id)
      expect(invoice).toHaveProperty('total')
      expect(invoice.total).toBeGreaterThan(0)
    })
  })
})