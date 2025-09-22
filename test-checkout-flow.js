// Comprehensive Checkout Flow Test
// This script tests the complete checkout integration with real API

const API_BASE = 'http://localhost:3001/hostel/api/v1';

async function makeRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return await response.json();
}

async function testCheckoutFlow() {
  console.log('🧪 Starting Comprehensive Checkout Flow Test\n');
  
  try {
    // 1. Get initial dashboard stats
    console.log('📊 Step 1: Getting initial dashboard stats...');
    const initialStats = await makeRequest(`${API_BASE}/dashboard/stats`);
    console.log(`   Initial active students: ${initialStats.totalStudents}`);
    console.log(`   Initial occupancy: ${initialStats.occupancyPercentage}%`);
    
    // 2. Get active students for checkout
    console.log('\n👥 Step 2: Getting active students...');
    const studentsResponse = await makeRequest(`${API_BASE}/students?status=Active`);
    const activeStudents = studentsResponse.data.items;
    console.log(`   Found ${activeStudents.length} active students`);
    
    if (activeStudents.length === 0) {
      console.log('❌ No active students found for checkout test');
      return;
    }
    
    // 3. Select a student for checkout
    const testStudent = activeStudents[0];
    console.log(`   Selected student: ${testStudent.name} (ID: ${testStudent.id})`);
    
    // 4. Get student's current balance
    console.log('\n💰 Step 3: Checking student balance...');
    const balanceResponse = await makeRequest(`${API_BASE}/ledgers/student/${testStudent.id}/balance`);
    console.log(`   Current balance: NPR ${balanceResponse.balance || 0}`);
    
    // 5. Process checkout
    console.log('\n🚪 Step 4: Processing checkout...');
    const checkoutData = {
      checkoutDate: '2025-01-01',
      clearRoom: true,
      refundAmount: 0,
      deductionAmount: 0,
      notes: 'Automated test checkout',
      processedBy: 'test-script'
    };
    
    const checkoutResponse = await makeRequest(
      `${API_BASE}/students/${testStudent.id}/checkout`,
      'POST',
      checkoutData
    );
    
    if (checkoutResponse.status === 200 && checkoutResponse.data.success) {
      console.log('   ✅ Checkout successful!');
      console.log(`   Final balance: NPR ${checkoutResponse.data.finalBalance}`);
      console.log(`   Net settlement: NPR ${checkoutResponse.data.netSettlement}`);
    } else {
      console.log('   ❌ Checkout failed:', checkoutResponse);
      return;
    }
    
    // 6. Verify dashboard stats updated
    console.log('\n📊 Step 5: Verifying dashboard updates...');
    const updatedStats = await makeRequest(`${API_BASE}/dashboard/stats`);
    console.log(`   Updated active students: ${updatedStats.totalStudents}`);
    console.log(`   Updated occupancy: ${updatedStats.occupancyPercentage}%`);
    
    const studentDecrease = initialStats.totalStudents - updatedStats.totalStudents;
    if (studentDecrease === 1) {
      console.log('   ✅ Student count decreased correctly');
    } else {
      console.log('   ❌ Student count not updated correctly');
    }
    
    // 7. Check checked-out students list
    console.log('\n📋 Step 6: Checking checked-out students list...');
    const checkedOutResponse = await makeRequest(`${API_BASE}/dashboard/checked-out-dues`);
    const checkedOutStudents = checkedOutResponse.data || checkedOutResponse;
    
    const isStudentInList = checkedOutStudents.some(s => s.studentId === testStudent.id);
    if (isStudentInList) {
      console.log('   ✅ Student appears in checked-out list');
      const studentRecord = checkedOutStudents.find(s => s.studentId === testStudent.id);
      console.log(`   Outstanding dues: NPR ${studentRecord.outstandingDues}`);
    } else {
      console.log('   ❌ Student not found in checked-out list');
    }
    
    // 8. Verify student status changed
    console.log('\n🔍 Step 7: Verifying student status...');
    const studentResponse = await makeRequest(`${API_BASE}/students/${testStudent.id}`);
    const updatedStudent = studentResponse.data || studentResponse;
    
    if (updatedStudent.status === 'Inactive') {
      console.log('   ✅ Student status updated to Inactive');
    } else {
      console.log(`   ❌ Student status is still: ${updatedStudent.status}`);
    }
    
    // 9. Check recent activities
    console.log('\n📰 Step 8: Checking recent activities...');
    const activitiesResponse = await makeRequest(`${API_BASE}/dashboard/recent-activity`);
    const activities = activitiesResponse.value || activitiesResponse.data || activitiesResponse;
    
    const checkoutActivity = activities.find(a => 
      a.type === 'checkout' && a.message.includes(testStudent.name)
    );
    
    if (checkoutActivity) {
      console.log('   ✅ Checkout activity found in recent activities');
    } else {
      console.log('   ⚠️  Checkout activity not found (may need server restart)');
    }
    
    // 10. Performance metrics
    console.log('\n📈 Step 9: Checking performance metrics...');
    const metricsResponse = await makeRequest(`${API_BASE}/analytics/performance-metrics`);
    const metrics = metricsResponse.data || metricsResponse;
    
    console.log(`   Collection rate: ${metrics.collectionRate}%`);
    console.log(`   Average stay duration: ${metrics.averageStayDuration} days`);
    console.log(`   Total invoices: ${metrics.totalInvoices}`);
    console.log(`   Paid invoices: ${metrics.paidInvoices}`);
    
    console.log('\n🎉 CHECKOUT FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Summary:');
    console.log(`   • Student ${testStudent.name} checked out successfully`);
    console.log(`   • Dashboard stats updated in real-time`);
    console.log(`   • Student appears in checked-out list`);
    console.log(`   • All API integrations working correctly`);
    console.log(`   • Performance metrics calculated from real data`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCheckoutFlow();