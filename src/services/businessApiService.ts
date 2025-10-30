import { apiService } from './apiService';

export interface Business {
  id: string;
  name: string;
  avatar: string;
  address: string;
  kahaId: string;
  coverImage: string;
  images: string[];
  category: {
    id: string;
    name: string;
    iconUrl: string;
    markerUrl: string;
    level: string | null;
  };
  rating: number;
}

export interface BusinessBulkResponse {
  businesses: Business[];
}

export interface BusinessBulkRequest {
  categoryId: string;
  includeDescendants?: boolean;
  limit?: number;
  offset?: number;
  name?: string; // Add name field for search
}

class BusinessApiService {
  private readonly baseUrl = 'https://dev.kaha.com.np/main/api/v3';

  /**
   * Fetch businesses in bulk with pagination
   */
  async fetchBusinessesBulk(params: BusinessBulkRequest): Promise<BusinessBulkResponse> {
    try {
      const requestBody: any = {
        categoryId: params.categoryId,
        includeDescendants: params.includeDescendants ?? true,
        limit: params.limit ?? 10,
        offset: params.offset ?? 0,
      };

      // Add name field to request body if provided for search
      if (params.name) {
        requestBody.name = params.name;
      }

      const response = await fetch(`${this.baseUrl}/businesses/bulk`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BusinessBulkResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  }

  /**
   * Fetch businesses with pagination support
   */
  async fetchBusinessesWithPagination(
    categoryId: string,
    limit: number = 10,
    offset: number = 0,
    searchName?: string
  ): Promise<BusinessBulkResponse> {
    return this.fetchBusinessesBulk({
      categoryId,
      includeDescendants: true,
      limit,
      offset,
      name: searchName,
    });
  }

  /**
   * Load more businesses (for "See More" functionality)
   */
  async loadMoreBusinesses(
    categoryId: string,
    currentBusinesses: Business[],
    limit: number = 10,
    searchName?: string
  ): Promise<Business[]> {
    const offset = currentBusinesses.length;
    const response = await this.fetchBusinessesWithPagination(categoryId, limit, offset, searchName);
    return response.businesses;
  }

  /**
   * Search businesses by name
   */
  async searchBusinesses(
    categoryId: string,
    searchName: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<BusinessBulkResponse> {
    return this.fetchBusinessesBulk({
      categoryId,
      includeDescendants: true,
      limit,
      offset,
      name: searchName,
    });
  }
}

export const businessApiService = new BusinessApiService();