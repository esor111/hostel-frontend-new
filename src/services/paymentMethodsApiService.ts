import { apiService } from './apiService';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export class PaymentMethodsApiService {
  private apiService = apiService;

  /**
   * Get all available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      console.log('💳 Fetching payment methods...');
      
      const response = await this.apiService.get<PaymentMethod[]>('/payment-methods');
      
      // Handle backend API response structure: { status: 200, data: [...] }
      const methods = response?.data || response || [];
      
      console.log('✅ Payment methods fetched:', methods.length, 'methods');
      
      return Array.isArray(methods) ? methods : [];
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      
      // Fallback to basic payment methods
      return [
        { id: 'cash', name: 'Cash', description: 'Cash payment' },
        { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer' },
        { id: 'online', name: 'Online Payment', description: 'Online payment gateway' }
      ];
    }
  }
}

// Export singleton instance
export const paymentMethodsApiService = new PaymentMethodsApiService();