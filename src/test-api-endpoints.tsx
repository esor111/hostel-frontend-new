import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

interface ApiTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'idle' | 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export const TestApiEndpoints: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3001/hostel/api/v1');
  const [tests, setTests] = useState<ApiTest[]>([
    { name: 'Health Check', endpoint: '/health', method: 'GET', status: 'idle' },
    { name: 'Students List', endpoint: '/students', method: 'GET', status: 'idle' },
    { name: 'Students Stats', endpoint: '/students/stats', method: 'GET', status: 'idle' },
    { name: 'Payments List', endpoint: '/payments', method: 'GET', status: 'idle' },
    { name: 'Payment Stats', endpoint: '/payments/stats', method: 'GET', status: 'idle' },
    { name: 'Payment Methods', endpoint: '/payments/methods', method: 'GET', status: 'idle' },
    { name: 'Ledger Entries', endpoint: '/ledgers', method: 'GET', status: 'idle' },
    { name: 'Ledger Stats', endpoint: '/ledgers/stats', method: 'GET', status: 'idle' },
    { name: 'Admin Charges', endpoint: '/admin/charges', method: 'GET', status: 'idle' },
    { name: 'Discounts List', endpoint: '/discounts', method: 'GET', status: 'idle' },
    { name: 'Discount Types', endpoint: '/discounts/types', method: 'GET', status: 'idle' },
  ]);

  const updateTest = (index: number, updates: Partial<ApiTest>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const testEndpoint = async (index: number) => {
    const test = tests[index];
    updateTest(index, { status: 'testing', error: undefined, response: undefined });

    const startTime = Date.now();
    
    try {
      const url = `${baseUrl}${test.endpoint}`;
      console.log(`🧪 Testing ${test.method} ${url}`);

      const response = await fetch(url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      updateTest(index, {
        status: 'success',
        response: data,
        duration
      });

      console.log(`✅ ${test.name} successful (${duration}ms):`, data);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      updateTest(index, {
        status: 'error',
        error: errorMessage,
        duration
      });

      console.error(`❌ ${test.name} failed (${duration}ms):`, errorMessage);
    }
  };

  const testAllEndpoints = async () => {
    console.log('🚀 Testing all API endpoints...');
    
    for (let i = 0; i < tests.length; i++) {
      await testEndpoint(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🏁 All API tests completed');
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({
      ...test,
      status: 'idle' as const,
      response: undefined,
      error: undefined,
      duration: undefined
    })));
  };

  const getStatusColor = (status: ApiTest['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ApiTest['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⚪';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const testingCount = tests.filter(t => t.status === 'testing').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔌 API Endpoints Test Suite
          </h1>
          <p className="text-gray-600">
            Test all backend API endpoints to verify connectivity and responses
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3001/hostel/api/v1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={testAllEndpoints} disabled={testingCount > 0}>
                  {testingCount > 0 ? '🔄 Testing...' : '🚀 Test All'}
                </Button>
                <Button variant="outline" onClick={resetTests}>
                  🔄 Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <div className="text-2xl">❌</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Testing</p>
                  <p className="text-2xl font-bold text-blue-600">{testingCount}</p>
                </div>
                <div className="text-2xl">🔄</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={test.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStatusIcon(test.status)}</span>
                      <div>
                        <span className="font-medium">{test.name}</span>
                        <div className="text-sm text-gray-600">
                          <Badge variant="outline" className="mr-2 text-xs">
                            {test.method}
                          </Badge>
                          {test.endpoint}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && (
                        <Badge variant="outline" className="text-xs">
                          {test.duration}ms
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testEndpoint(index)}
                        disabled={test.status === 'testing'}
                      >
                        {test.status === 'testing' ? '🔄' : '🧪'} Test
                      </Button>
                    </div>
                  </div>

                  {test.status === 'error' && test.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-sm">
                        {test.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {test.status === 'success' && test.response && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-600 cursor-pointer">
                        View Response ({typeof test.response === 'object' ? Object.keys(test.response).length : 'N/A'} keys)
                      </summary>
                      <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-40">
                        {JSON.stringify(test.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Tests:</span> {tests.length}
              </div>
              <div>
                <span className="font-medium">Success Rate:</span> {tests.length > 0 ? Math.round((successCount / tests.length) * 100) : 0}%
              </div>
              <div>
                <span className="font-medium">Average Response:</span> {
                  tests.filter(t => t.duration).length > 0 
                    ? Math.round(tests.filter(t => t.duration).reduce((sum, t) => sum + (t.duration || 0), 0) / tests.filter(t => t.duration).length)
                    : 0
                }ms
              </div>
              <div>
                <span className="font-medium">Status:</span> {
                  errorCount > 0 ? '❌ Issues Found' : 
                  successCount === tests.length ? '✅ All Good' : 
                  '⏳ Incomplete'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestApiEndpoints;