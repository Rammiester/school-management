const mongoose = require('mongoose');
const ClassPayment = require('../models/ClassPayment');
const Student = require('../models/Student');

// Test the class payment data integration
async function testClassPaymentIntegration() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/school', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Test 1: Get class payment data for class 7th
    console.log('\n=== Testing Class Payment Data ===');
    const classPayment = await ClassPayment.findOne({ className: '7th' });
    if (classPayment) {
      console.log('Class Payment Data for 7th:');
      console.log('Class Name:', classPayment.className);
      console.log('Payments:');
      classPayment.payments.forEach(payment => {
        console.log(`  ${payment.department}: ${payment.amount}`);
      });
      
      // Create payment map for easy lookup
      const paymentMap = {};
      classPayment.payments.forEach(payment => {
        paymentMap[payment.department] = payment.amount;
      });
      console.log('Payment Map:', paymentMap);
    } else {
      console.log('No class payment data found for 7th class');
    }
    
    // Test 2: Get students in class 7th
    console.log('\n=== Testing Student Data ===');
    const students = await Student.find({ grade: '7th' });
    console.log(`Found ${students.length} students in class 7th`);
    students.forEach(student => {
      console.log(`  - ${student.name} (ID: ${student.admissionId})`);
    });
    
    // Test 3: Simulate the mapping logic
    console.log('\n=== Testing Fee Type Mapping ===');
    const feeTypes = ['AcademicPay', 'SportPay', 'LibraryPay', 'HostalPay', 'TransportPay'];
    const classPaymentData = classPayment ? 
      classPayment.payments.reduce((acc, payment) => {
        acc[payment.department] = payment.amount;
        return acc;
      }, {}) : {};
    
    console.log('Class Payment Data Map:', classPaymentData);
    
    feeTypes.forEach(feeType => {
      let department = feeType.replace('Pay', '');
      switch(department) {
        case 'Hostal':
          department = 'Hostel';
          break;
        case 'Total':
          department = 'Academics';
          break;
      }
      
      const amount = classPaymentData[department] || 0;
      console.log(`${feeType} -> ${department}: ${amount}`);
    });
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testClassPaymentIntegration();
