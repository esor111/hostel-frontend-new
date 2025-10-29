import { buildApiUrl, getEnvironmentConfig } from '../config/environment';
import { ApiError, handleApiError, logApiError } from '../utils/errorHandler';
import { authService } from './authService';

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiService {
  private static instance: ApiService;
  private readonly config = getEnvironmentConfig();

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    const { timeout = 30000, retries = 3, ...fetchOptions } = options;
    
    // Get authentication token
    const token = authService.getApiToken();
    
    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    };

    let lastError: Error;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (this.config.debugMode) {
          console.log(`[API Request] ${requestOptions.method || 'GET'} ${url}`, {
            attempt: attempt + 1,
            body: requestOptions.body,
          });
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        
        if (this.config.debugMode) {
          console.log(`[API Response] ${requestOptions.method || 'GET'} ${url}`, data);
        }

        // Handle different NestJS response formats
        // Check for paginated response (has both data and pagination)
        if (data.data !== undefined && data.pagination !== undefined) {
          return data; // Return the full paginated response
        }
        // Check for paginated response with items array
        if (data.data?.items !== undefined) return data.data.items;
        if (data.data !== undefined) return data.data;
        if (data.result !== undefined) return data.result;
        if (data.stats !== undefined) return data.stats;
        return data;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new ApiError('Request timeout. Please try again.');
          }
          
          if (error.message.includes('HTTP 4')) {
            // Client errors (4xx) shouldn't be retried
            const apiError = handleApiError(error);
            logApiError(apiError, `${requestOptions.method || 'GET'} ${endpoint}`);
            throw apiError;
          }

          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Network errors - don't retry in tests
            if (attempt >= retries) {
              const apiError = handleApiError(error);
              logApiError(apiError, `${requestOptions.method || 'GET'} ${endpoint}`);
              throw apiError;
            }
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const apiError = handleApiError(lastError!);
    logApiError(apiError, `${requestOptions.method || 'GET'} ${endpoint}`);
    throw apiError;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();