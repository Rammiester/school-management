// Test script to verify the template API is working correctly
const axios = require('axios');

// First, let's get the actual template ID from the database
async function getTemplateId() {
  try {
    const response = await axios.get('http://localhost:3001/api/billing-templates');
    console.log('Available templates:', response.data);
    if (response.data.length > 0) {
      return response.data[0]._id;
    }
  } catch (error) {
    console.error('Error getting templates:', error.message);
  }
  return null;
}

// Test data with proper template ID
const testData = {
  generationType: 'class',
  months: 1,
  generatedBy: 'test-user-id',
  templateId: '68cfdf5a8ddc0fded846253a', // From our previous check - actual template ID
  classFilter: {
    className: '7th'
  },
  description: 'Fee for @Class class, Student ID: @Student ID:@Id, AcademicPay: @AcademicPay, TransportPay: @TransportPay'
};

async function testTemplateGeneration() {
  try {
    console.log('Testing template generation API with data:');
    console.log('Template ID:', testData.templateId);
    console.log('Class:', testData.classFilter.className);
    console.log('Description:', testData.description);
    
    const response = await axios.post('http://localhost:3001/api/template/generate-from-template', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error in template generation:', error.response?.data || error.message);
  }
}

// Also test the summary endpoint
async function testSummaryEndpoint() {
  try {
    console.log('\nTesting summary endpoint for class 7th...');
    const response = await axios.get('http://localhost:3001/api/template/summary/7th');
    console.log('Summary response:', response.data);
  } catch (error) {
    console.error('Error in summary endpoint:', error.response?.data || error.message);
  }
}

// Run tests
testSummaryEndpoint();
setTimeout(() => {
  testTemplateGeneration();
}, 2000);
