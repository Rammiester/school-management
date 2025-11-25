// Test script for finance API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFinanceEndpoints() {
  console.log('Testing Finance API Endpoints...');
  
  try {
    // Test summary endpoint
    console.log('\n1. Testing /api/finance/summary');
    const summaryResponse = await axios.get(`${BASE_URL}/api/finance/summary`);
    console.log('✓ Summary response:', summaryResponse.data);
    
    // Test revenue-expense endpoint
    console.log('\n2. Testing /api/finance/revenue-expense');
    const revenueExpenseResponse = await axios.get(`${BASE_URL}/api/finance/revenue-expense`);
    console.log('✓ Revenue/Expense response length:', revenueExpenseResponse.data.length);
    console.log('✓ Sample data:', revenueExpenseResponse.data.slice(0, 3));
    
    // Test revenue-breakdown endpoint
    console.log('\n3. Testing /api/finance/revenue-breakdown');
    const revenueBreakdownResponse = await axios.get(`${BASE_URL}/api/finance/revenue-breakdown`);
    console.log('✓ Revenue Breakdown response length:', revenueBreakdownResponse.data.length);
    console.log('✓ Sample data:', revenueBreakdownResponse.data.slice(0, 3));
    
    // Test expense-breakdown endpoint
    console.log('\n4. Testing /api/finance/expense-breakdown');
    const expenseBreakdownResponse = await axios.get(`${BASE_URL}/api/finance/expense-breakdown`);
    console.log('✓ Expense Breakdown response length:', expenseBreakdownResponse.data.length);
    console.log('✓ Sample data:', expenseBreakdownResponse.data.slice(0, 3));
    
    console.log('\n✅ All Finance API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Finance API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testFinanceEndpoints();
