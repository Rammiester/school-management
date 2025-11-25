const mongoose = require('mongoose');
require('dotenv').config();

// Load the timetable data
async function importTimetable() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');

    console.log('Connected to MongoDB');

    // Import the class1 timetable data
    const timetableData = require('../data/class1-timetable.json');
    
    // Check if timetable already exists
    const Timetable = require('../models/Timetable');
    const existingTimetable = await Timetable.findOne({ class: timetableData.class });
    
    if (existingTimetable) {
      console.log(`Timetable for class ${timetableData.class} already exists. Updating...`);
      await Timetable.updateOne(
        { class: timetableData.class },
        { schedule: timetableData.schedule }
      );
    } else {
      console.log(`Creating timetable for class ${timetableData.class}`);
      await Timetable.create(timetableData);
    }

    console.log('Timetable data imported successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error importing timetable:', error);
    process.exit(1);
  }
}

// Run the import
importTimetable();
