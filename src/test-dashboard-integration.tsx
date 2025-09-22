import React from 'react';
import { dashboardApiService } from './services/dashboardApiService';
import { useDashboard } from './hooks/useDashboard';

// Simple test component to verify dashboard integration
const DashboardIntegrationTest: React.FC = () => {
  const {
    stats,
    recentActivities,
    loading,
    error,
    refreshDashboard,
    hasData
  } = useDashboard({
    loadOnMount: true,
    autoRefresh: false
  });

  const testDirectApiCall = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      const directStats = await dashboardApiService.getDashboardStats();
      console.log('✅ Direct API call successful:', directStats);
      
      const directActivities = await dashboardApiService.getRecentActivities(5);
      console.log('✅ Direct activities call successful:', directActivities.length, 'activities');
      
      const overview = await dashboardApiService.getDashboardOverview();
      console.log('✅ Overview call successful:', overview);
    } catch (error) {
      console.error('❌ Direct API call failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard API Integration Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Hook Status</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Has Data: {hasData ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Dashboard Stats</h2>
          {stats ? (
            <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre>
          ) : (
            <p>No stats loaded</p>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Recent Activities ({recentActivities.length})</h2>
          {recentActivities.length > 0 ? (
            <ul className="space-y-2">
              {recentActivities.slice(0, 3).map((activity) => (
                <li key={activity.id} className="text-sm">
                  <strong>{activity.type}:</strong> {activity.message || activity.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>No activities loaded</p>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={refreshDashboard}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
          
          <button 
            onClick={testDirectApiCall}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Test Direct API Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardIntegrationTest;