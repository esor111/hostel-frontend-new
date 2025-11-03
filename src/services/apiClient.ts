/**
 * API Client - Re-export from lib for backward compatibility
 * This file exists to support services that import from './apiClient'
 */

export { apiClient, API_BASE_URL } from '../lib/api-client';
export default apiClient;
