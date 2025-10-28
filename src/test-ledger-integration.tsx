import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import { paymentsApiService } from './services/paymentsApiService';
import { ledgerApiService } from './services/ledgerApiService';
import { studentsApiService } from './services/studentsApiService';
import { adminChargesApiService } from './services/adminChargesApiService';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const TestLedgerIntegration: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const updateTest = (testName: string, status: TestResult['status'], message: string, data?: any) => {
    setTests(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, data }
        : test
    ));
  };

  const initializeTests = () => {
    const testList: TestResult[] = [
      { test: 'Load Students', status: 'pending', message: 'Loading students...' },
      { test: 'Load Payments', status: 'pending', message: 'Loading payments...' },
      { test: 'Load Ledger Entries', status: 'pending', message: 'Loading ledger...' },
      { test: 'Student Balance Check', status: 'pending', message: 'Checking balance...' },
      { test: 'Record Test Payment', status: 'pending', message: 'Recording payment...' },
      { test: 'Verify Ledger Update', status: 'pending', message: 'Verifying ledger...' },
      { test: 'Create Admin Charge', status: 'pending', message: 'Creating charge...' },
      { test: 'Verify Charge in Ledger', status: 'pending', message: 'Verifying charge...' },
    ];
    setTests(testList);
  };

  const runComprehensiveTest = async () => {
    setRunning(true);
    initializeTests();

    try {
      // Test 1: Load Students
      console.log('🧪 Test 1: Loading students...');
      const students = await studentsApiService.getStudents();
      updateTest('Load Students', 'success', `Loaded ${students.length} students`, students);
      
      if (students.length === 0) {
        updateTest('Load Students', 'error', 'No students found - cannot continue tests');
        setRunning(false);
        return;
      }

      const testStudent = students[0];
      setSelectedStudent(testStudent);

      // Test 2: Load Payments
      console.log('🧪 Test 2: Loading payments...');
      const paymentsResult = await paymentsApiService.getPayments({ limit: 10 });
      updateTest('Load Payments', 'success', `Loaded ${paymentsResult.items.length} payments`, paymentsResult);

      // Test 3: Load Ledger Entries
      console.log('🧪 Test 3: Loading ledger entries...');
      const ledgerResult = await ledgerApiService.getLedgerEntries({ limit: 10 });
      updateTest('Load Ledger Entries', 'success', `Loaded ${ledgerResult.items.length} ledger entries`, ledgerResult);

      // Test 4: Student Balance Check
      console.log('🧪 Test 4: Checking student balance...');
      const balance = await ledgerApiService.getStudentBalance(testStudent.id);
      updateTest('Student Balance Check', 'success', `Balance: NPR ${balance.currentBalance} (${balance.balanceType})`, balance);

      // Test 5: Record Test Payment
      console.log('🧪 Test 5: Recording test payment...');
      const testPayment = {
        studentId: testStudent.id,
        amount: 100,
        paymentMethod: 'Cash' as const,
        notes: 'Integration test payment',
        status: 'Completed' as const
      };
      
      const recordedPayment = await paymentsApiService.recordPayment(testPayment);
      updateTest('Record Test Payment', 'success', `Payment recorded: NPR ${recordedPayment.amount}`, recordedPayment);

      // Wait a moment for ledger to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 6: Verify Ledger Update
      console.log('🧪 Test 6: Verifying ledger update...');
      const updatedLedger = await ledgerApiService.getStudentLedger(testStudent.id);
      const paymentEntry = updatedLedger.find(entry => 
        entry.type === 'Payment' && 
        entry.referenceId === recordedPayment.id
      );
      
      if (paymentEntry) {
        updateTest('Verify Ledger Update', 'success', `Payment found in ledger: NPR ${paymentEntry.credit}`, paymentEntry);
      } else {
        updateTest('Verify Ledger Update', 'error', 'Payment not found in ledger - integration issue!');
      }

      // Test 7: Create Admin Charge
      console.log('🧪 Test 7: Creating admin charge...');
      const testCharge = {
        studentId: testStudent.id,
        title: 'Integration Test Charge',
        amount: 50,
        description: 'Test charge for integration verification',
        chargeType: 'penalty',
        category: 'other'
      };

      const createdCharge = await adminChargesApiService.createAdminCharge(testCharge);
      updateTest('Create Admin Charge', 'success', `Charge created: NPR ${createdCharge.amount}`, createdCharge);

      // Wait a moment for ledger to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 8: Verify Charge in Ledger
      console.log('🧪 Test 8: Verifying charge in ledger...');
      const finalLedger = await ledgerApiService.getStudentLedger(testStudent.id);
      const chargeEntry = finalLedger.find(entry => 
        entry.type === 'Adjustment' && 
        entry.description.includes('Integration Test Charge')
      );

      if (chargeEntry) {
        updateTest('Verify Charge in Ledger', 'success', `Charge found in ledger: NPR ${chargeEntry.debit}`, chargeEntry);
      } else {
        updateTest('Verify Charge in Ledger', 'error', 'Charge not found in ledger - integration issue!');
      }

    } catch (error) {
      console.error('🧪 Test failed:', error);
      const currentTest = tests.find(t => t.status === 'pending');
      if (currentTest) {
        updateTest(currentTest.test, 'error', `Error: ${error.message}`);
      }
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Ledger Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive test to verify API-Frontend-Ledger integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <div className="text-3xl">❌</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Integration Test Results</span>
              <Button 
                onClick={runComprehensiveTest} 
                disabled={running}
                className="ml-4"
              >
                {running ? '🔄 Running Tests...' : '🚀 Run Integration Tests'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Click "Run Integration Tests" to start the comprehensive test suite.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div key={test.test} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getStatusIcon(test.status)}</span>
                        <span className="font-medium">{index + 1}. {test.test}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm ml-8">{test.message}</p>
                    {test.data && test.status === 'success' && (
                      <details className="mt-2 ml-8">
                        <summary className="text-xs text-gray-600 cursor-pointer">View Data</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Test Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {selectedStudent.name}
                </div>
                <div>
                  <span className="font-medium">ID:</span> {selectedStudent.id}
                </div>
                <div>
                  <span className="font-medium">Room:</span> {selectedStudent.roomNumber || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Balance:</span> NPR {selectedStudent.currentBalance || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestLedgerIntegration;