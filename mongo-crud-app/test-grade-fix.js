// Test the grade matching logic
const testCases = [
  { input: '12th', expected: ['12th', '12'] },
  { input: '12', expected: ['12th', '12'] },
  { input: '1st', expected: ['1st', '1'] },
  { input: '1', expected: ['1st', '1'] },
  { input: '10th', expected: ['10th', '10'] },
  { input: '10', expected: ['10th', '10'] },
  { input: '11th', expected: ['11th', '11'] },
  { input: '11', expected: ['11th', '11'] }
];

console.log('Testing regex patterns:');
testCases.forEach(({ input, expected }) => {
  let gradePattern;
  if (input.endsWith('st') || input.endsWith('nd') || input.endsWith('rd') || input.endsWith('th')) {
    const numberPart = input.slice(0, -2);
    gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
  } else {
    gradePattern = new RegExp(`^${input}(st|nd|rd|th)?$`, 'i');
  }
  
  console.log(`Input: ${input} -> Pattern: ${gradePattern}`);
  expected.forEach(testGrade => {
    console.log(`  Matches ${testGrade}: ${gradePattern.test(testGrade)}`);
  });
  console.log('');
});

// Test with actual grade data from database
const sampleGrades = ['12th', '1st', '2nd', '3rd', '10th', '11th'];
console.log('Testing with sample database grades:');
sampleGrades.forEach(dbGrade => {
  const inputGrade = '12th';
  let gradePattern;
  if (inputGrade.endsWith('st') || inputGrade.endsWith('nd') || inputGrade.endsWith('rd') || inputGrade.endsWith('th')) {
    const numberPart = inputGrade.slice(0, -2);
    gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
  } else {
    gradePattern = new RegExp(`^${inputGrade}(st|nd|rd|th)?$`, 'i');
  }
  console.log(`API call for '12th' should match DB grade '${dbGrade}': ${gradePattern.test(dbGrade)}`);
});
