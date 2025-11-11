// Test script to verify image upload functionality
const fs = require('fs');
const path = require('path');

// Check if uploads directory exists and is writable
const uploadDir = path.join(__dirname, 'uploads');

console.log('Testing image upload directory setup...');

try {
  // Check if directory exists
  const exists = fs.existsSync(uploadDir);
  console.log(`Uploads directory exists: ${exists}`);
  
  if (!exists) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created successfully');
  }
  
  // Test write permissions
  const testFile = path.join(uploadDir, 'test-write.txt');
  fs.writeFileSync(testFile, 'test write access');
  fs.unlinkSync(testFile);
  console.log('Write permissions confirmed');
  
  // List contents if directory exists
  if (exists) {
    const contents = fs.readdirSync(uploadDir);
    console.log('Directory contents:', contents);
  }
  
  console.log('✅ Image upload directory setup test passed');
  
} catch (error) {
  console.error('❌ Image upload directory setup test failed:', error.message);
  process.exit(1);
}
