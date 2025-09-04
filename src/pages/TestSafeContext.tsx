import React from 'react';
import { useSafeAppContext } from '@/contexts/SafeAppContext';

export default function TestSafeContext() {
  const { state, refreshData } = useSafeAppContext();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎉 React Hooks Working!
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Context Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Loading</h3>
              <p className="text-green-600">{state.loading ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Students</h3>
              <p className="text-blue-600">{state.students.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Error</h3>
              <p className="text-purple-600">{state.error || 'None'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Students Data</h2>
            <button
              onClick={refreshData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={state.loading}
            >
              {state.loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
          
          {state.students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Room</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {state.students.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{student.roomNumber}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">₹{student.currentBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No students data available</p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Success!
          </h3>
          <p className="text-green-700">
            React hooks are working correctly. The context is loading and managing state properly.
            You can now use the full application with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}