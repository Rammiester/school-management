// Script to import class payments data into MongoDB
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const ClassPayment = require('../models/ClassPayment');

// Connect to MongoDB using the same method as the main app
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for import'))
.catch(err => console.error('MongoDB connection error for import:', err));

// Import class payments data
const importClassPaymentsData = async () => {
  try {
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
