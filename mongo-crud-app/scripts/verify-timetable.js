const mongoose = require('mongoose');
require('dotenv').config();

async function verifyTimetable() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');

    console.log('Connected to MongoDB');

    // Import the Timetable model
    const Timetable = require('../models/Timetable');
    
    // Find the class1 timetable
    const timetable = await Timetable.findOne({ class: 'class1' });
    
    if (timetable) {
      console.log('Timetable data for class1 found successfully!');
      console.log(`Class: ${timetable.class}`);
      console.log(`Number of days: ${Object.keys(timetable.schedule).length}`);
      
      // Show the structure
      for (const [day, lessons] of Object.entries(timetable.schedule)) {
        console.log(`${day}: ${lessons.length} lessons`);
      }
      
      // Show first lesson of Monday as example
      if (timetable.schedule.Monday && timetable.schedule.Monday.length > 0) {
        const firstLesson = timetable.schedule.Monday[0];
        console.log('\nFirst lesson on Monday:');
        console.log(`  Time: ${firstLesson.time}`);
        console.log(`  Subject: ${firstLesson.subject}`);
        console.log(`  Teacher: ${firstLesson.teacher}`);
        console.log(`  Room: ${firstLesson.room}`);
      }
    } else {
      console.log('Timetable data for class1 not found');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error verifying timetable:', error);
    process.exit(1);
  }
}

// Run the verification
verifyTimetable();
