import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getEnvironmentConfig } from '@/config/environment';

// Get environment configuration
const envConfig = getEnvironmentConfig();

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get business token from localStorage (used for hostel API calls)
    const token = localStorage.getItem('kaha_business_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug mode logging
    if (envConfig.debugMode) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Debug mode logging
    if (envConfig.debugMode) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      console.error(`[API Error ${status}]`, {
        url: error.config?.url,
        message: data?.message || error.message,
        data,
      });

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('authToken');
          // You might want to redirect to login page here
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden:', data?.message);
          break;
        case 404:
          console.error('Resource not found:', error.config?.url);
          break;
        case 500:
          console.error('Server error:', data?.message);
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API No Response]', error.message);
    } else {
      // Error setting up the request
      console.error('[API Setup Error]', error.message);
    }

    return Promise.reject(error);
  }
);

// Export API base URL for services that need it
export const API_BASE_URL = envConfig.apiBaseUrl;

// Export configured axios instance as default
export default apiClient;
