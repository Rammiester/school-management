// Simple script to import class payments data into MongoDB
const fs = require('fs');
const mongoose = require('mongoose');

// Connect to MongoDB directly
mongoose.connect('mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import class payments data
const importClassPaymentsData = async () => {
  try {
    const ClassPayment = require('../models/ClassPayment');
    
    // Read the JSON file
    const classPaymentsData = require('../data/class-payments-data.json');
    
    // Clear existing data
    await ClassPayment.deleteMany({});
    console.log('Existing class payments data cleared');
    
    // Insert new data
    const insertedData = await ClassPayment.insertMany(classPaymentsData);
    console.log(`${insertedData.length} class payments records imported successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing class payments data:', error);
    process.exit(1);
  }
};

importClassPaymentsData();
