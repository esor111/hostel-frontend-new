import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testRealApiConnection } from '../../utils/testRealApi';
import { useStudents } from '../../hooks/useStudents';

export const ApiTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  
  // Test using our hook
  const { students, loading, error, stats, loadStudents, loadStudentStats } = useStudents();

  const runApiTest = async () => {
    setTesting(true);
    const result = await testRealApiConnection();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Real API Connection Test
            {testResult?.success && <Badge className="bg-green-500">Connected</Badge>}
            {testResult?.success === false && <Badge variant="destructive">Failed</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runApiTest} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Testing...' : 'Test Real NestJS Server Connection'}
          </Button>
          
          {testResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎣 useStudents Hook Test
            {loading && <Badge variant="secondary">Loading</Badge>}
            {error && <Badge variant="destructive">Error</Badge>}
            {students.length > 0 && <Badge className="bg-green-500">Data Loaded</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={loadStudents} disabled={loading}>
              Load Students ({students.length})
            </Button>
            <Button onClick={loadStudentStats} disabled={loading}>
              Load Stats
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}
          
          {stats && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Student Statistics:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: {stats.total}</div>
                <div>Active: {stats.active}</div>
                <div>Inactive: {stats.inactive}</div>
                <div>Total Dues: NPR {stats.totalDues?.toLocaleString()}</div>
              </div>
            </div>
          )}
          
          {students.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sample Students:</h4>
              <div className="space-y-2">
                {students.slice(0, 3).map(student => (
                  <div key={student.id} className="text-sm">
                    <strong>{student.name}</strong> - {student.phone} - {student.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};