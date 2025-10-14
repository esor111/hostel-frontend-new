/**
 * Authentication Service for Kaha Main v3 API
 * Handles user login, business fetching, and profile switching
 */

export interface LoginCredentials {
  contactNumber: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: string;
}

export interface Business {
  id: string;
  kahaId: string;
  name: string;
  address: string;
  avatar: string;
}

export interface BusinessesResponse {
  data: Business[];
}

export interface SwitchProfileRequest {
  businessId: string;
}

export interface SwitchProfileResponse {
  accessToken: string;
  role: string;
}

export interface AuthTokens {
  userToken: string | null;
  businessToken: string | null;
  selectedBusiness: Business | null;
}

class AuthService {
  private static instance: AuthService;
  private readonly KAHA_MAIN_API_BASE = 'https://dev.kaha.com.np/main/api/v3';
  
  // Token storage keys
  private readonly USER_TOKEN_KEY = 'kaha_user_token';
  private readonly BUSINESS_TOKEN_KEY = 'kaha_business_token';
  private readonly SELECTED_BUSINESS_KEY = 'kaha_selected_business';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Step 1: User Login
   * Call POST /auth/login to get user token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.contactNumber);
      
      const response = await fetch(`${this.KAHA_MAIN_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status} ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      
      // Store user token
      this.setUserToken(data.accessToken);
      
      console.log('✅ Login successful, user token stored');
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Step 2: Fetch User's Businesses (Hostels)
   * Call GET /businesses/my with user token
   * Supports search and pagination
   */
  async fetchBusinesses(params?: { name?: string; page?: number; take?: number }): Promise<{ data: Business[]; total: number; page: number; totalPages: number }> {
    const userToken = this.getUserToken();
    if (!userToken) {
      throw new Error('No user token available. Please login first.');
    }

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.name) queryParams.append('name', params.name);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.take) queryParams.append('take', params.take.toString());
      
      const queryString = queryParams.toString();
      const url = `${this.KAHA_MAIN_API_BASE}/businesses/my${queryString ? `?${queryString}` : ''}`;
      
      console.log('🏢 Fetching user businesses:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch businesses: ${response.status} ${response.statusText}`);
      }

      const responseData: any = await response.json();
      
      // Handle both old format (just array) and new format (with pagination)
      if (Array.isArray(responseData.data)) {
        const businesses = responseData.data;
        console.log(`✅ Fetched ${businesses.length} businesses`);
        
        return {
          data: businesses,
          total: responseData.total || businesses.length,
          page: responseData.page || params?.page || 1,
          totalPages: responseData.totalPages || 1
        };
      } else {
        // Fallback for old API format
        const businesses = responseData.data || [];
        return {
          data: businesses,
          total: businesses.length,
          page: 1,
          totalPages: 1
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch businesses:', error);
      throw error;
    }
  }

  /**
   * Step 3: Switch Profile (Get Business Token)
   * Call POST /auth/switch-profile with businessId
   */
  async switchProfile(businessId: string): Promise<SwitchProfileResponse> {
    const userToken = this.getUserToken();
    if (!userToken) {
      throw new Error('No user token available. Please login first.');
    }

    try {
      console.log('🔄 Switching to business profile:', businessId);
      
      const response = await fetch(`${this.KAHA_MAIN_API_BASE}/auth/switch-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Profile switch failed: ${response.status} ${response.statusText}`);
      }

      const data: SwitchProfileResponse = await response.json();
      
      // Store business token
      this.setBusinessToken(data.accessToken);
      
      console.log('✅ Profile switched successfully, business token stored');
      return data;
    } catch (error) {
      console.error('❌ Profile switch failed:', error);
      throw error;
    }
  }

  /**
   * Complete authentication flow: login + fetch businesses
   */
  async authenticateUser(credentials: LoginCredentials): Promise<Business[]> {
    await this.login(credentials);
    return await this.fetchBusinesses();
  }

  /**
   * Complete business selection flow: switch profile + store business info
   */
  async selectBusiness(business: Business): Promise<SwitchProfileResponse> {
    const result = await this.switchProfile(business.id);
    this.setSelectedBusiness(business);
    return result;
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================

  /**
   * Get current user token
   */
  getUserToken(): string | null {
    try {
      return localStorage.getItem(this.USER_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  /**
   * Get current business token (used for API calls)
   */
  getBusinessToken(): string | null {
    try {
      return localStorage.getItem(this.BUSINESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting business token:', error);
      return null;
    }
  }

  /**
   * Get currently selected business
   */
  getSelectedBusiness(): Business | null {
    try {
      const stored = localStorage.getItem(this.SELECTED_BUSINESS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting selected business:', error);
      return null;
    }
  }

  /**
   * Get all current auth tokens and state
   */
  getAuthTokens(): AuthTokens {
    return {
      userToken: this.getUserToken(),
      businessToken: this.getBusinessToken(),
      selectedBusiness: this.getSelectedBusiness(),
    };
  }

  /**
   * Set user token
   */
  private setUserToken(token: string): void {
    try {
      localStorage.setItem(this.USER_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing user token:', error);
    }
  }

  /**
   * Set business token
   */
  private setBusinessToken(token: string): void {
    try {
      localStorage.setItem(this.BUSINESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing business token:', error);
    }
  }

  /**
   * Set selected business
   */
  private setSelectedBusiness(business: Business): void {
    try {
      localStorage.setItem(this.SELECTED_BUSINESS_KEY, JSON.stringify(business));
    } catch (error) {
      console.error('Error storing selected business:', error);
    }
  }

  // ========================================
  // AUTHENTICATION STATE
  // ========================================

  /**
   * Check if user is logged in (has user token)
   */
  isLoggedIn(): boolean {
    return !!this.getUserToken();
  }

  /**
   * Check if user has selected a business (has business token)
   */
  hasSelectedBusiness(): boolean {
    return !!this.getBusinessToken() && !!this.getSelectedBusiness();
  }

  /**
   * Check if user is fully authenticated and ready to use the app
   */
  isFullyAuthenticated(): boolean {
    return this.isLoggedIn() && this.hasSelectedBusiness();
  }

  /**
   * Get the token to use for API calls (business token if available, otherwise user token)
   */
  getApiToken(): string | null {
    return this.getBusinessToken() || this.getUserToken();
  }

  // ========================================
  // LOGOUT AND CLEANUP
  // ========================================

  /**
   * Logout user and clear all tokens
   */
  logout(): void {
    try {
      localStorage.removeItem(this.USER_TOKEN_KEY);
      localStorage.removeItem(this.BUSINESS_TOKEN_KEY);
      localStorage.removeItem(this.SELECTED_BUSINESS_KEY);
      console.log('✅ User logged out, all tokens cleared');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Clear business selection (keep user logged in)
   */
  clearBusinessSelection(): void {
    try {
      localStorage.removeItem(this.BUSINESS_TOKEN_KEY);
      localStorage.removeItem(this.SELECTED_BUSINESS_KEY);
      console.log('✅ Business selection cleared');
    } catch (error) {
      console.error('Error clearing business selection:', error);
    }
  }

  // ========================================
  // TOKEN VALIDATION
  // ========================================

  /**
   * Decode JWT token to check expiration (basic check)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't decode
    }
  }

  /**
   * Check if current tokens are valid (not expired)
   */
  areTokensValid(): boolean {
    const userToken = this.getUserToken();
    const businessToken = this.getBusinessToken();

    if (userToken && this.isTokenExpired(userToken)) {
      console.warn('User token is expired');
      return false;
    }

    if (businessToken && this.isTokenExpired(businessToken)) {
      console.warn('Business token is expired');
      return false;
    }

    return true;
  }

  /**
   * Refresh authentication if tokens are expired
   */
  async refreshAuthenticationIfNeeded(): Promise<boolean> {
    if (!this.areTokensValid()) {
      console.log('Tokens are expired, clearing authentication');
      this.logout();
      return false;
    }
    return true;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();