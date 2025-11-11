// Comprehensive S3 connection test script
const AWS = require('aws-sdk');
require('dotenv').config();

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

async function testS3Connection() {
  console.log('=== Testing S3 Connection ===');
  console.log('Bucket Name:', bucketName);
  console.log('Region:', process.env.AWS_REGION);
  console.log('');

  try {
    // Test 1: Check if bucket exists and is accessible
    console.log('1. Testing bucket accessibility...');
    const listParams = {
      Bucket: bucketName,
      MaxKeys: 1 // Just check if we can access the bucket
    };

    const listResult = await s3.listObjectsV2(listParams).promise();
    console.log('✅ Bucket is accessible');
    console.log('   Objects in bucket:', listResult.KeyCount);
    console.log('');

    // Test 2: Upload a test file
    console.log('2. Testing file upload...');
    const testContent = `Test file uploaded at ${new Date().toISOString()}\nThis confirms S3 connection is working properly.`;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: `test-connection-${Date.now()}.txt`,
      Body: testContent,
      ContentType: 'text/plain'
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    console.log('✅ File uploaded successfully');
    console.log('   Upload URL:', uploadResult.Location);
    console.log('   File Key:', uploadResult.Key);
    console.log('');

    // Test 3: List objects in bucket
    console.log('3. Testing object listing...');
    const listAllParams = {
      Bucket: bucketName
    };

    const fullListResult = await s3.listObjectsV2(listAllParams).promise();
    console.log('✅ Object listing successful');
    console.log('   Total objects:', fullListResult.KeyCount);
    
    if (fullListResult.Contents.length > 0) {
      console.log('   Recent objects:');
      fullListResult.Contents.slice(0, 5).forEach(obj => {
        console.log(`     - ${obj.Key} (${obj.Size} bytes, ${new Date(obj.LastModified).toLocaleString()})`);
      });
    }
    console.log('');

    // Test 4: Delete the test file
    console.log('4. Testing file deletion (cleaning up test file)...');
    const deleteParams = {
      Bucket: bucketName,
      Key: uploadResult.Key
    };

    await s3.deleteObject(deleteParams).promise();
    console.log('✅ Test file deleted successfully');
    console.log('');

    console.log('🎉 All S3 tests passed! Your S3 bucket is working properly.');
    console.log('');
    console.log('S3 Configuration Summary:');
    console.log('- Bucket Name:', bucketName);
    console.log('- Region:', process.env.AWS_REGION);
    console.log('- Status: ✅ CONNECTED AND WORKING');

  } catch (error) {
    console.error('❌ S3 test failed:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    
    if (error.code === 'NoSuchBucket') {
      console.error('\n⚠️  The bucket does not exist. Please create the bucket first.');
    } else if (error.code === 'InvalidAccessKeyId' || error.code === 'SignatureDoesNotMatch') {
      console.error('\n⚠️  Invalid AWS credentials. Please check your access key and secret key.');
    } else if (error.code === 'AccessDenied') {
      console.error('\n⚠️  Access denied. Please check your AWS permissions.');
    }
    
    process.exit(1);
  }
}

// Run the test
testS3Connection();
