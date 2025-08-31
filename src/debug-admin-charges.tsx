import React, { useState, useEffect } from 'react';
import { adminChargesApiService } from './services/adminChargesApiService';

export const DebugAdminCharges = () => {
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const testApiService = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing adminChargesApiService.getTodaySummary()...');
      
      const response = await adminChargesApiService.getTodaySummary();
      console.log('✅ API Service Response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      
      setTodaySummary(response);
      setRawResponse(response);
    } catch (err) {
      console.error('❌ API Service Error:', err);
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
      
      console.log('✅ Direct Fetch Response:', data);
      console.log('✅ Data field:', data.data);
      
      setRawResponse(data);
      setTodaySummary(data.data);
    } catch (err) {
      console.error('❌ Direct Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiService();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">🔍 Admin Charges Debug</h1>
      
      <div className="flex gap-4">
        <button 
          onClick={testApiService}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test API Service
        </button>
        <button 
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Direct Fetch
        </button>
      </div>

      {loading && (
        <div className="text-blue-600 font-semibold">🔄 Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">❌ Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw Response */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📄 Raw API Response</h3>
          <pre className="bg-white p-3 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>

        {/* Parsed Summary */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📊 Parsed Today's Summary</h3>
          <pre className="bg-white p-3 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(todaySummary, null, 2)}
          </pre>
        </div>
      </div>

      {/* Display Cards */}
      {todaySummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-blue-800">📈 Summary Cards Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Charges</p>
              <p className="text-2xl font-bold text-blue-600">
                {todaySummary?.totalCharges || 0}
              </p>
              <p className="text-xs text-gray-500">
                Raw value: {JSON.stringify(todaySummary?.totalCharges)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                NPR {(todaySummary?.totalAmount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Raw value: {JSON.stringify(todaySummary?.totalAmount)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Students Charged</p>
              <p className="text-2xl font-bold text-purple-600">
                {todaySummary?.studentsCharged || 0}
              </p>
              <p className="text-xs text-gray-500">
                Raw value: {JSON.stringify(todaySummary?.studentsCharged)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State Debug */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-yellow-800">🐛 State Debug</h3>
        <div className="space-y-2 text-sm">
          <p><strong>todaySummary is null:</strong> {(todaySummary === null).toString()}</p>
          <p><strong>todaySummary is undefined:</strong> {(todaySummary === undefined).toString()}</p>
          <p><strong>todaySummary type:</strong> {typeof todaySummary}</p>
          <p><strong>todaySummary keys:</strong> {todaySummary ? Object.keys(todaySummary).join(', ') : 'N/A'}</p>
          <p><strong>todaySummary?.totalCharges:</strong> {JSON.stringify(todaySummary?.totalCharges)}</p>
          <p><strong>Boolean check (todaySummary?.totalCharges || 0):</strong> {todaySummary?.totalCharges || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugAdminCharges;