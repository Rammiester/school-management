const mongoose = require('mongoose');
const Student = require('../models/Student');
const Billing = require('../models/Billing');
const User = require('../models/User');
require('dotenv').config();

const verifyBilling = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // 1. Create a test user (if none exists)
    let testUser = await User.findOne({ email: 'test.chairman@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test Chairman',
        email: 'test.chairman@example.com',
        password: 'password123', // In a real app, hash this
        role: 'chairman',
      });
      await testUser.save();
    }
    console.log('Test user created');

    // 2. Create a test student
    const testStudent = new Student({
      name: 'Test Student',
      uniqueId: `test${Date.now()}`,
      admissionYear: new Date().getFullYear(),
      cityCode: 'tst',
      department: 'academics',
      parentContact: '+15551234567', // Use a valid test number
    });
    await testStudent.save();
    console.log('Test student created');

    // 3. Generate a bill
    const bill = new Billing({
      student: testStudent._id,
      department: 'academics',
      items: [{ description: 'Test Fee', amount: 100 }],
      amount: 100,
      dueDate: new Date(),
      generatedBy: testUser._id,
    });
    await bill.save();
    console.log('Bill generated');

    // 4. Mark the bill as paid
    bill.status = 'paid';
    await bill.save();
    console.log('Bill marked as paid');

    // 5. Clean up test data
    await Student.findByIdAndDelete(testStudent._id);
    await Billing.findByIdAndDelete(bill._id);
    await User.findByIdAndDelete(testUser._id);
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Billing verification failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

verifyBilling();