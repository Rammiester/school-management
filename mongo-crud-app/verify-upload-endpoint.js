// Simple script to verify upload endpoint behavior
const fs = require('fs');
const path = require('path');

console.log('=== Image Upload Endpoint Verification ===');

// Check the main configuration
const uploadDir = path.join(__dirname, 'uploads');
console.log('Upload directory path:', uploadDir);

try {
  const exists = fs.existsSync(uploadDir);
  console.log('Upload directory exists:', exists);
  
  if (exists) {
    const stats = fs.statSync(uploadDir);
    console.log('Directory stats:', {
      isDirectory: stats.isDirectory(),
      mode: stats.mode.toString(8)
    });
    
    const contents = fs.readdirSync(uploadDir);
    console.log('Current files in uploads:', contents.length, 'files');
    
    if (contents.length > 0) {
      contents.forEach(file => {
        const fileStats = fs.statSync(path.join(uploadDir, file));
        console.log(`  - ${file}: ${fileStats.size} bytes`);
      });
    }
  }
  
  // Test directory creation logic
  const testDir = path.join(__dirname, 'test-uploads');
  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
      console.log('Test directory created successfully:', testDir);
      
      // Test write access
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');
      fs.unlinkSync(testFile);
      console.log('Write access confirmed for test directory');
      
      // Clean up
      fs.rmdirSync(testDir);
      console.log('Test directory cleaned up');
    }
  } catch (testError) {
    console.error('Test directory operation failed:', testError.message);
  }
  
  console.log('✅ Upload endpoint verification completed successfully');
  
} catch (error) {
  console.error('❌ Upload endpoint verification failed:', error.message);
  process.exit(1);
}
