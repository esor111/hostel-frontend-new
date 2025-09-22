import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService } from '../../services/apiService';
import { ApiError } from '../../utils/errorHandler';
import { server, addHandlers } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3001/hostel/api/v1';

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = ApiService.getInstance();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const result = await apiService.get('/students/1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('email');
    });

    it('should handle query parameters', async () => {
      const result = await apiService.get('/students', { search: 'John', status: 'Active' });

      expect(Array.isArray(result)).toBe(true);
      // Should filter results based on search and status
      expect(result.every((student: any) => student.status === 'Active')).toBe(true);
    });

    it('should handle API errors', async () => {
      await expect(apiService.get('/students/999')).rejects.toThrow('Student not found');
    });

    it('should handle network errors', async () => {
      // Add a handler that simulates network failure
      addHandlers(
        http.get(`${BASE_URL}/network-error-test`, () => {
          return HttpResponse.error();
        })
      );

      await expect(apiService.get('/network-error-test')).rejects.toThrow();
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const postData = { name: 'New Student', email: 'test@example.com', phone: '9841111111' };

      const result = await apiService.post('/students', postData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(postData.name);
      expect(result.email).toBe(postData.email);
      expect(result.phone).toBe(postData.phone);
    });
  });

  describe('Response format handling', () => {
    it('should handle data format', async () => {
      // Students endpoint returns { data: [...] } format
      const result = await apiService.get('/students');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle result format', async () => {
      // Add a custom handler for result format
      addHandlers(
        http.get(`${BASE_URL}/test-result`, () => {
          return HttpResponse.json({ result: { id: '1', name: 'Test' } });
        })
      );

      const result = await apiService.get('/test-result');
      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('should handle stats format', async () => {
      // Dashboard stats endpoint returns { stats: {...} } format
      const result = await apiService.get('/dashboard/stats');
      expect(result).toHaveProperty('totalStudents');
      expect(result).toHaveProperty('activeStudents');
    });
  });

  describe('Health check', () => {
    it('should return true for successful health check', async () => {
      const result = await apiService.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false for failed health check', async () => {
      // Add a handler that simulates health check failure
      addHandlers(
        http.get(`${BASE_URL}/health`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await apiService.healthCheck();
      expect(result).toBe(false);
    });
  });
});