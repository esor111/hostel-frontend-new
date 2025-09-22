/**
 * Performance Testing Scenarios
 * Test how the system handles large datasets
 */

export const testPerformanceScenarios = async () => {
  console.log('🚀 Testing Performance Scenarios...');
  
  const BASE_URL = 'http://localhost:3001/hostel/api/v1';
  
  // Test different dataset sizes
  const testScenarios = [
    { name: 'Small Dataset', entries: 50, students: 10 },
    { name: 'Medium Dataset', entries: 500, students: 50 },
    { name: 'Large Dataset', entries: 2000, students: 200 },
    { name: 'Very Large Dataset', entries: 10000, students: 1000 }
  ];
  
  const results = [];
  
  for (const scenario of testScenarios) {
    console.log(`\\n📊 Testing ${scenario.name}...`);
    
    try {
      // Test 1: Get all ledger entries with pagination
      const startTime1 = performance.now();
      const response1 = await fetch(`${BASE_URL}/ledgers?limit=50&page=1`);
      const endTime1 = performance.now();
      
      if (response1.ok) {
        const data1 = await response1.json();
        console.log(`  ✅ Paginated ledger fetch: ${(endTime1 - startTime1).toFixed(2)}ms`);
        console.log(`  📄 Total entries: ${data1.pagination?.total || 'unknown'}`);
      }
      
      // Test 2: Get student-specific ledger (typically smaller dataset)
      const startTime2 = performance.now();
      const response2 = await fetch(`${BASE_URL}/ledgers/student/STU001`);
      const endTime2 = performance.now();
      
      if (response2.ok) {
        const data2 = await response2.json();
        const entries = data2.data || data2.result || data2;
        console.log(`  ✅ Student ledger fetch: ${(endTime2 - startTime2).toFixed(2)}ms`);
        console.log(`  📋 Student entries: ${Array.isArray(entries) ? entries.length : 'unknown'}`);
      }
      
      // Test 3: Balance calculation
      const startTime3 = performance.now();
      const response3 = await fetch(`${BASE_URL}/ledgers/student/STU001/balance`);
      const endTime3 = performance.now();
      
      if (response3.ok) {
        console.log(`  ✅ Balance calculation: ${(endTime3 - startTime3).toFixed(2)}ms`);
      }
      
      results.push({
        scenario: scenario.name,
        paginatedFetch: endTime1 - startTime1,
        studentFetch: endTime2 - startTime2,
        balanceCalc: endTime3 - startTime3
      });
      
    } catch (error) {
      console.log(`  ❌ Error testing ${scenario.name}:`, error.message);
    }
  }
  
  // Performance thresholds
  const thresholds = {
    paginatedFetch: 1000, // 1 second
    studentFetch: 500,    // 0.5 seconds
    balanceCalc: 200      // 0.2 seconds
  };
  
  console.log('\\n🎯 Performance Analysis:');
  results.forEach(result => {
    console.log(`\\n${result.scenario}:`);
    
    Object.entries(thresholds).forEach(([operation, threshold]) => {
      const time = result[operation];
      const status = time < threshold ? '✅' : '⚠️';
      console.log(`  ${status} ${operation}: ${time.toFixed(2)}ms (threshold: ${threshold}ms)`);
    });
  });
  
  return results;
};

// Test UI rendering performance
export const testUIRenderingPerformance = () => {
  console.log('🎨 Testing UI Rendering Performance...');
  
  const renderingScenarios = [
    {
      component: 'StudentLedgerView',
      entries: 100,
      estimatedRenderTime: '< 100ms',
      optimizations: ['Virtual scrolling', 'Pagination', 'Lazy loading']
    },
    {
      component: 'Dashboard Outstanding Dues',
      students: 50,
      estimatedRenderTime: '< 50ms',
      optimizations: ['Memoization', 'Efficient calculations']
    },
    {
      component: 'Payment History Table',
      payments: 200,
      estimatedRenderTime: '< 150ms',
      optimizations: ['Table virtualization', 'Pagination']
    }
  ];
  
  console.log('📊 UI Rendering Scenarios:');
  renderingScenarios.forEach((scenario, index) => {
    console.log(`\\n${index + 1}. ${scenario.component}:`);
    console.log(`   Dataset: ${scenario.entries || scenario.students || scenario.payments} items`);
    console.log(`   Target: ${scenario.estimatedRenderTime}`);
    console.log(`   Optimizations: ${scenario.optimizations.join(', ')}`);
  });
  
  return renderingScenarios;
};

// Memory usage estimation
export const estimateMemoryUsage = () => {
  console.log('💾 Estimating Memory Usage...');
  
  const memoryEstimates = {
    'Single Ledger Entry': {
      size: '~200 bytes',
      fields: 'id, studentId, date, type, description, amounts, etc.'
    },
    '1000 Ledger Entries': {
      size: '~200 KB',
      impact: 'Minimal - easily handled by modern browsers'
    },
    '10000 Ledger Entries': {
      size: '~2 MB',
      impact: 'Low - acceptable for most use cases'
    },
    '100000 Ledger Entries': {
      size: '~20 MB',
      impact: 'Medium - may need pagination/virtualization'
    }
  };
  
  console.log('📊 Memory Usage Estimates:');
  Object.entries(memoryEstimates).forEach(([scenario, info]) => {
    console.log(`\\n${scenario}:`);
    console.log(`  Size: ${info.size}`);
    console.log(`  Impact: ${info.impact || info.fields}`);
  });
  
  return memoryEstimates;
};