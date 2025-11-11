const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
  console.log('Testing email configuration...');
  
  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration not found in environment variables');
    console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return false;
 }

  console.log(`📧 Testing with email: ${process.env.EMAIL_USER}`);

  try {
    // Create transporter with the same configuration as in generateFromTemplate.js
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test the connection
    const result = await transporter.verify();
    console.log('✅ Email configuration is valid!');
    console.log('✅ SMTP connection successful');
    console.log('✅ Ready to send emails');
    return true;

  } catch (error) {
    console.log('❌ Email configuration test failed:');
    console.log('Error:', error.message);
    
    if (error.responseCode === 535) {
      console.log('\n📝 This error typically means:');
      console.log('   - Invalid email or password');
      console.log('   - You need to use a Gmail App Password (not regular password)');
      console.log('   - 2-Factor Authentication must be enabled on your Google account');
      console.log('   - Generate an App Password at: https://myaccount.google.com/apppasswords');
    }
    
    return false;
  }
}

// Run the test
testEmailConfig().then((success) => {
  if (success) {
    console.log('\n🎉 Email configuration is ready to use!');
  } else {
    console.log('\n❌ Please fix the email configuration and try again.');
    console.log('📖 Refer to EMAIL_SETUP.md for detailed setup instructions.');
  }
});
