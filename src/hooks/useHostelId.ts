/**
 * Custom hook to get hostelId from auth context
 * This provides a React-friendly way to access the current hostel's businessId
 */

import { useAuth } from '../contexts/AuthContext';

export const useHostelId = (): string | null => {
  const { state } = useAuth();
  
  // Return the selected business ID (which is the hostelId/businessId)
  const hostelId = state.selectedBusiness?.id || null;
  
  // Debug logging
  console.log('🔍 useHostelId - Auth state:', state.authState);
  console.log('🔍 useHostelId - Selected business:', state.selectedBusiness);
  console.log('🔍 useHostelId - Hostel ID:', hostelId);
  
  return hostelId;
};

export default useHostelId;