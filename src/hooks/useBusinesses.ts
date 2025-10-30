import { useState, useEffect, useCallback } from 'react';
import { businessApiService, Business } from '@/services/businessApiService';

interface UseBusinessesOptions {
  categoryId: string;
  initialLimit?: number;
  loadMoreLimit?: number;
  searchName?: string; // Add search functionality
}

interface UseBusinessesReturn {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadingMore: boolean;
  search: (searchTerm: string) => Promise<void>; // Add search function
}

export const useBusinesses = ({
  categoryId,
  initialLimit = 10,
  loadMoreLimit = 10,
  searchName,
}: UseBusinessesOptions): UseBusinessesReturn => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string | undefined>(searchName);

  // Initial load
  const loadInitialBusinesses = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await businessApiService.fetchBusinessesWithPagination(
        categoryId,
        initialLimit,
        0,
        searchTerm
      );
      
      setBusinesses(response.businesses);
      setHasMore(response.businesses.length === initialLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses');
      console.error('Error loading initial businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, initialLimit]);

  // Load more businesses
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const newBusinesses = await businessApiService.loadMoreBusinesses(
        categoryId,
        businesses,
        loadMoreLimit,
        currentSearchTerm
      );

      if (newBusinesses.length === 0) {
        setHasMore(false);
      } else {
        setBusinesses(prev => [...prev, ...newBusinesses]);
        setHasMore(newBusinesses.length === loadMoreLimit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more businesses');
      console.error('Error loading more businesses:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [categoryId, businesses, loadMoreLimit, loadingMore, hasMore, currentSearchTerm]);

  // Search businesses
  const search = useCallback(async (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    setBusinesses([]);
    setHasMore(true);
    await loadInitialBusinesses(searchTerm);
  }, [loadInitialBusinesses]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setBusinesses([]);
    setHasMore(true);
    await loadInitialBusinesses(currentSearchTerm);
  }, [loadInitialBusinesses, currentSearchTerm]);

  // Load initial data on mount or when categoryId changes
  useEffect(() => {
    loadInitialBusinesses(currentSearchTerm);
  }, [loadInitialBusinesses, currentSearchTerm]);

  return {
    businesses,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadingMore,
    search,
  };
};