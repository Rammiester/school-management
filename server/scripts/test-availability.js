const mongoose = require('mongoose');
const User = require('../models/User');

// Test script to verify availability functionality
async function testAvailability() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/school_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Test creating a test user
    const testUser = new User({
      name: 'Test Teacher',
      email: 'test.teacher@example.com',
      password: 'password123',
      role: 'teacher',
      status: 'approved'
    });
    
    await testUser.save();
    console.log('Created test user:', testUser._id);
    
    // Test getting availability status
    const availability = await User.getAvailabilityStatus(testUser._id);
    console.log('User availability:', availability);
    
    // Test checking if user is busy at a specific time (this will return false since we don't have timetable data)
    const isBusy = await User.isBusyAtTime(testUser._id, new Date(), '9:00-10:00');
    console.log('Is user busy at 9:00-10:00:', isBusy);
    
    // Test updating user availability
    await User.findByIdAndUpdate(testUser._id, { isAvailable: false });
    const updatedAvailability = await User.getAvailabilityStatus(testUser._id);
    console.log('Updated availability:', updatedAvailability);
    
    console.log('Test completed successfully');
    
    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAvailability();
