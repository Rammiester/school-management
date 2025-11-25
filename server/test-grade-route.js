const express = require('express');
const Student = require('./models/Student');

// Test the grade normalization logic directly
function normalizeGrade(grade) {
  console.log('Input grade:', grade);
  let searchGrade = grade;
  if (grade.endsWith('th') || grade.endsWith('st') || grade.endsWith('nd') || grade.endsWith('rd')) {
    searchGrade = grade.slice(0, -2);
    console.log('Normalized grade:', searchGrade);
  }
  return searchGrade;
}

// Test cases
const testGrades = ['1st', '2nd', '3rd', '4th', '10th', '11th', '12th', '1', '2', '3'];
testGrades.forEach(grade => {
  console.log(`\nTesting grade: ${grade}`);
  const result = normalizeGrade(grade);
  console.log(`Result: ${result}`);
});

console.log('\nTesting database query for grade "3":');
async function testQuery() {
  try {
    const count = await Student.countDocuments({ grade: '3' });
    console.log(`Students with grade "3": ${count}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testQuery();
