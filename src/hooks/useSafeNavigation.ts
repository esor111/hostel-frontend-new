import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useSafeNavigation = () => {
  let navigate: ReturnType<typeof useNavigate>;
  
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('Navigation hook not available, using fallback:', error);
    // Fallback navigation function
    navigate = ((path: string) => {
      window.location.href = path;
    }) as any;
  }

  const safeNavigate = useCallback((path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.warn('Navigation failed, using fallback:', error);
      window.location.href = path;
    }
  }, [navigate]);

  return safeNavigate;
};