/**
 * Debug component to test hostelId functionality
 * Add this to any page to see what's happening with hostelId
 */

import React, { useEffect, useState } from 'react';
import { useHostelId } from './hooks/useHostelId';
import { roomsApiService } from './services/roomsApiService';

export const DebugHostelId: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const hostelIdFromHook = useHostelId();

  useEffect(() => {
    const checkHostelId = () => {
      // Check localStorage directly
      const userToken = localStorage.getItem('kaha_user_token');
      const businessToken = localStorage.getItem('kaha_business_token');
      const selectedBusiness = localStorage.getItem('kaha_selected_business');
      
      let parsedBusiness = null;
      try {
        parsedBusiness = selectedBusiness ? JSON.parse(selectedBusiness) : null;
      } catch (e) {
        console.error('Failed to parse selected business:', e);
      }

      setDebugInfo({
        hasUserToken: !!userToken,
        hasBusinessToken: !!businessToken,
        hasSelectedBusiness: !!selectedBusiness,
        selectedBusinessRaw: selectedBusiness,
        selectedBusinessParsed: parsedBusiness,
        hostelIdFromBusiness: parsedBusiness?.id || null,
        hostelIdFromHook: hostelIdFromHook,
      });
    };

    checkHostelId();
  }, [hostelIdFromHook]);

  const testRoomsAPI = async () => {
    try {
      console.log('🧪 Testing rooms API call...');
      const rooms = await roomsApiService.getRooms({ page: 1, limit: 5 });
      console.log('🧪 Rooms API result:', rooms);
      alert(`Rooms API returned ${rooms.length} rooms. Check console for details.`);
    } catch (error) {
      console.error('🧪 Rooms API error:', error);
      alert(`Rooms API failed: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🔍 HostelId Debug Info</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Auth Tokens:</strong><br/>
        User Token: {debugInfo.hasUserToken ? '✅ Present' : '❌ Missing'}<br/>
        Business Token: {debugInfo.hasBusinessToken ? '✅ Present' : '❌ Missing'}<br/>
        Selected Business: {debugInfo.hasSelectedBusiness ? '✅ Present' : '❌ Missing'}
      </div>

      {debugInfo.selectedBusinessParsed && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Selected Business:</strong><br/>
          ID: {debugInfo.selectedBusinessParsed.id}<br/>
          Name: {debugInfo.selectedBusinessParsed.name}<br/>
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <strong>HostelId Sources:</strong><br/>
        From Business: {debugInfo.hostelIdFromBusiness || 'null'}<br/>
        From Hook: {debugInfo.hostelIdFromHook || 'null'}
      </div>

      <button 
        onClick={testRoomsAPI}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🧪 Test Rooms API
      </button>

      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default DebugHostelId;