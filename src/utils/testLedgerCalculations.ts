/**
 * Comprehensive Ledger Calculation Test
 * This will help me understand exactly how the backend calculates balances
 */

export const testLedgerCalculations = async () => {
  console.log('🧮 Testing Ledger Balance Calculations...');
  
  const BASE_URL = 'http://localhost:3001/hostel/api/v1';
  
  try {
    // 1. Test getting all ledger entries
    console.log('1. Testing GET /ledgers...');
    const allLedgersResponse = await fetch(`${BASE_URL}/ledgers`);
    
    if (!allLedgersResponse.ok) {
      throw new Error(`Ledgers API failed: ${allLedgersResponse.status}`);
    }
    
    const allLedgersData = await allLedgersResponse.json();
    console.log('✅ All ledgers response:', allLedgersData);
    
    // 2. Test getting ledger stats
    console.log('2. Testing GET /ledgers/stats...');
    const statsResponse = await fetch(`${BASE_URL}/ledgers/stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Ledger stats:', statsData);
    } else {
      console.log('⚠️ Stats endpoint not available');
    }
    
    // 3. Test getting student-specific ledger
    console.log('3. Testing student-specific ledger...');
    
    // First get a student ID
    const studentsResponse = await fetch(`${BASE_URL}/students`);
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      const students = studentsData.data || studentsData.result || studentsData;
      
      if (students && students.length > 0) {
        const testStudentId = students[0].id;
        console.log(`Testing with student ID: ${testStudentId}`);
        
        // Get student ledger
        const studentLedgerResponse = await fetch(`${BASE_URL}/ledgers/student/${testStudentId}`);
        
        if (studentLedgerResponse.ok) {
          const studentLedgerData = await studentLedgerResponse.json();
          console.log('✅ Student ledger:', studentLedgerData);
          
          // Test balance calculation
          const balanceResponse = await fetch(`${BASE_URL}/ledgers/student/${testStudentId}/balance`);
          
          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            console.log('✅ Student balance:', balanceData);
            
            // Manual calculation verification
            const entries = studentLedgerData.data || studentLedgerData.result || studentLedgerData;
            if (Array.isArray(entries)) {
              let manualBalance = 0;
              entries.forEach(entry => {
                manualBalance += (entry.debit || 0) - (entry.credit || 0);
              });
              
              console.log('🔍 Manual calculation:', manualBalance);
              console.log('🔍 API calculation:', balanceData.data?.currentBalance || balanceData.currentBalance);
              
              const apiBalance = balanceData.data?.currentBalance || balanceData.currentBalance || 0;
              const difference = Math.abs(manualBalance - apiBalance);
              
              if (difference < 0.01) {
                console.log('✅ Balance calculations match!');
              } else {
                console.log('❌ Balance calculations differ by:', difference);
              }
            }
          }
        }
      }
    }
    
    return {
      success: true,
      message: 'Ledger calculations tested successfully'
    };
    
  } catch (error) {
    console.error('❌ Ledger calculation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test specific balance calculation scenarios
export const testBalanceScenarios = () => {
  console.log('🧮 Testing Balance Calculation Scenarios...');
  
  // Scenario 1: Simple debit/credit
  const scenario1 = [
    { debit: 1000, credit: 0 },    // +1000 = 1000 Dr
    { debit: 0, credit: 500 },     // -500 = 500 Dr
    { debit: 200, credit: 0 },     // +200 = 700 Dr
    { debit: 0, credit: 800 }      // -800 = -100 Cr
  ];
  
  let balance1 = 0;
  scenario1.forEach((entry, index) => {
    balance1 += entry.debit - entry.credit;
    console.log(`Step ${index + 1}: Debit ${entry.debit}, Credit ${entry.credit}, Balance: ${balance1} ${balance1 > 0 ? 'Dr' : balance1 < 0 ? 'Cr' : 'Nil'}`);
  });
  
  // Scenario 2: Complex transactions
  const scenario2 = [
    { debit: 15000, credit: 0, desc: 'Monthly fee' },
    { debit: 0, credit: 10000, desc: 'Partial payment' },
    { debit: 500, credit: 0, desc: 'Late fee' },
    { debit: 0, credit: 5500, desc: 'Full payment' }
  ];
  
  let balance2 = 0;
  console.log('\\n📊 Complex Scenario:');
  scenario2.forEach((entry, index) => {
    balance2 += entry.debit - entry.credit;
    console.log(`${entry.desc}: Balance ${balance2} ${balance2 > 0 ? 'Dr' : balance2 < 0 ? 'Cr' : 'Nil'}`);
  });
  
  return {
    scenario1Result: balance1,
    scenario2Result: balance2
  };
};