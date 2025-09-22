import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { server } from './mocks/server'
import { resetMockData } from './mocks/handlers'

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  resetMockData()
})

afterAll(() => {
  server.close()
})

// Global test utilities
export const waitForApiCall = (timeout = 1000) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  return originalConsole
}

// Test data helpers
export { mockStudents, mockDashboardStats, mockPayments } from './mocks/mockData'
export { server, resetHandlers, addHandlers } from './mocks/server'