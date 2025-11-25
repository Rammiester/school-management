// Test script to verify the image upload endpoint
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadEndpoint() {
  console.log('=== Testing Image Upload Endpoint ===');
  
  try {
    // Create a simple test image (PNG format)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Create form data
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // Make request to upload endpoint
    const response = await axios.post('http://localhost:3001/api/images/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Upload endpoint test passed!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Upload endpoint test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3001');
    console.log('Server is running');
    return true;
  } catch (error) {
    console.log('Server might not be running. Please start the server with:');
    console.log('cd mongo-crud-app && node index.js');
    return false;
  }
}

// Run the test
async function runTest() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testUploadEndpoint();
  }
}

runTest();
