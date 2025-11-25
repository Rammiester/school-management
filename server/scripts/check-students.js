const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Student = require('../models/Student');

async function checkStudents() {
  try {
    console.log('Checking for students with class 7th...');
    const students = await Student.find({ class: '7th' });
    console.log('Students found with class 7th:', students.length);
    if (students.length > 0) {
      console.log('First student:', students[0].name, students[0].class);
    }
    
    console.log('Checking for students with grade 7th...');
    const studentsByGrade = await Student.find({ grade: '7th' });
    console.log('Students found with grade 7th:', studentsByGrade.length);
    if (studentsByGrade.length > 0) {
      console.log('First student by grade:', studentsByGrade[0].name, studentsByGrade[0].grade);
    }
    
    console.log('Checking for students with class field...');
    const studentsWithClass = await Student.find({ class: { $exists: true } }).limit(5);
    console.log('Students with class field:', studentsWithClass.length);
    studentsWithClass.forEach(s => console.log(s.name, s.class));
    
    console.log('Checking for students with grade field...');
    const studentsWithGrade = await Student.find({ grade: { $exists: true } }).limit(5);
    console.log('Students with grade field:', studentsWithGrade.length);
    studentsWithGrade.forEach(s => console.log(s.name, s.grade));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkStudents();
