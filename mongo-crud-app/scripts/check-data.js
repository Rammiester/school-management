// Simple script to check class payments data in MongoDB
const mongoose = require('mongoose');

// Connect to MongoDB directly
mongoose.connect('mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Check class payments data
const checkClassPaymentsData = async () => {
  try {
    const ClassPayment = require('../models/ClassPayment');
    
    // Count documents
    const count = await ClassPayment.countDocuments();
    console.log(`Total ClassPayment documents: ${count}`);
    
    // Find all documents
    const documents = await ClassPayment.find();
    console.log('Documents found:');
    console.log(JSON.stringify(documents, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking class payments data:', error);
    process.exit(1);
  }
};

checkClassPaymentsData();
