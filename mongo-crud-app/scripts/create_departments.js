const mongoose = require('mongoose');
require('dotenv').config();

// Import the Department model
const Department = require('../models/Department');

const departmentsData = [
  { name: 'Academics', description: 'Academic fees and charges' },
  { name: 'Sports', description: 'Sports and physical activities' },
  { name: 'Music', description: 'Music and performing arts' },
  { name: 'Dance', description: 'Dance and choreography' },
  { name: 'Art', description: 'Visual arts and crafts' },
  { name: 'Library', description: 'Library and research materials' },
  { name: 'Hostel', description: 'Boarding and accommodation' },
  { name: 'Transport', description: 'Transportation services' },
  { name: 'Food', description: 'Meals and dining services' },
  { name: 'Laboratory', description: 'Science and computer labs' },
  { name: 'Examination', description: 'Exam fees and assessment' },
  { name: 'Technology', description: 'Technology and equipment fees' },
  { name: 'Counseling', description: 'Student counseling services' },
  { name: 'Medical', description: 'Health and medical services' },
  { name: 'Security', description: 'Campus security services' }
];

const createDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing departments (optional - remove if you want to keep existing data)
    await Department.deleteMany({});
    console.log('Cleared existing departments');

    // Create new departments
    const createdDepartments = await Department.insertMany(departmentsData);
    console.log(`Created ${createdDepartments.length} departments:`);
    createdDepartments.forEach(dept => {
      console.log(`- ${dept.name}: ${dept.description}`);
    });

    console.log('Departments created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating departments:', error);
    process.exit(1);
  }
};

// Run the script
createDepartments();
