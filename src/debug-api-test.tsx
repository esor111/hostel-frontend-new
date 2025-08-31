import React, { useState } from 'react';
import { adminChargesApiService } from './services/adminChargesApiService';

export const DebugApiTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTodaySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing getTodaySummary...');
      const response = await adminChargesApiService.getTodaySummary();
      console.log('🧪 Response:', response);
      setResult(response);
    } catch (err: any) {
      console.error('🧪 Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testStats = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing getAdminChargeStats...');
      const response = await adminChargesApiService.getAdminChargeStats();
      console.log('🧪 Response:', response);
      setResult(response);
    } catch (err: any) {
      console.error('🧪 Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing direct fetch...');
      const response = await fetch('http://localhost:3001/hostel/api/v1/admin-charges/today-summary');
      const data = await response.json();
      console.log('🧪 Direct fetch response:', data);
      setResult(data);
    } catch (err: any) {
      console.error('🧪 Direct fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">🧪 API Debug Test</h3>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testTodaySummary}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Today Summary
        </button>
        <button 
          onClick={testStats}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Stats
        </button>
        <button 
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Direct Fetch
        </button>
      </div>

      {loading && <div className="text-blue-600">Loading...</div>}
      
      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-white p-4 rounded border">
          <strong>Result:</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};