import React, { useState, useEffect } from 'react';
import { adminChargesApiService } from './services/adminChargesApiService';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';

export const TestAdminChargesIntegration = () => {
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const testTodaySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing today\'s summary API...');
      
      // Test the API service directly
      const response = await adminChargesApiService.getTodaySummary();
      console.log('✅ API Response:', response);
      
      setTodaySummary(response);
      setRawResponse(response);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRawFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing raw fetch...');
      
      const response = await fetch('http://localhost:3001/hostel/api/v1/admin-charges/today-summary');
      const data = await response.json();
      
      console.log('✅ Raw Response:', data);
      setRawResponse(data);
      
      // Extract the data part
      if (data.success && data.data) {
        setTodaySummary(data.data);
      }
    } catch (err) {
      console.error('❌ Raw Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testTodaySummary();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Charges API Integration Test</h1>
      
      <div className="flex gap-4">
        <Button onClick={testTodaySummary} disabled={loading}>
          Test API Service
        </Button>
        <Button onClick={testRawFetch} disabled={loading}>
          Test Raw Fetch
        </Button>
      </div>

      {loading && (
        <div className="text-blue-600">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {todaySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Charges</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {todaySummary.totalCharges || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-700">
                    NPR {(todaySummary.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Students Charged</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {todaySummary.studentsCharged || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Pending Charges</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {todaySummary.pendingCharges || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parsed Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(todaySummary, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAdminChargesIntegration;