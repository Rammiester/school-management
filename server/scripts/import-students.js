const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Student = require('../models/Student');

const dbURI = 'mongodb://localhost:27017/crud-demo';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const workbook = xlsx.readFile('SRS_Students_200.xlsx');
const sheet_name_list = workbook.SheetNames;
const students_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

const excelDateToJSDate = (excelDate) => {
  if (typeof excelDate !== 'number' || excelDate <= 0) return null;
  const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
  return isNaN(date.getTime()) ? null : date;
};

const importStudents = async () => {
  try {
    const subjects = ['Math', 'Science', 'English', 'Hindi', 'Social'];
    // Generate all three terms for each year to ensure complete data
    const terms = [
      { term: 'Term1', type: 'Quarterly', academicYear: '2020' },
      { term: 'Term2', type: 'Half Yearly', academicYear: '2020' },
      { term: 'Term3', type: 'Annually', academicYear: '2020' },
      { term: 'Term1', type: 'Quarterly', academicYear: '2021' },
      { term: 'Term2', type: 'Half Yearly', academicYear: '2021' },
      { term: 'Term3', type: 'Annually', academicYear: '2021' },
      { term: 'Term1', type: 'Quarterly', academicYear: '2022' },
      { term: 'Term2', type: 'Half Yearly', academicYear: '2022' },
      { term: 'Term3', type: 'Annually', academicYear: '2022' }
    ];

    for (const student of students_data) {
      const admissionDate = excelDateToJSDate(student.Admission_Date);
      const admissionYear = admissionDate ? admissionDate.getFullYear() : null;
      const dob = excelDateToJSDate(student.Date_of_Birth);
      const age = dob ? Math.floor((new Date() - dob) / (1000 * 60 * 60 * 24 * 365.25)) : null;

      const marks = {};
      const testReports = [];
      const examResults = [];

      terms.forEach(({ term, type, academicYear }) => {
        let totalMarksForTerm = 0;
        let subjectsInTerm = 0;
        subjects.forEach(subject => {
          const marksKey = `Marks_${subject}_${term}`;
          const mark = student[marksKey];

          if (mark !== undefined && mark !== null) {
            totalMarksForTerm += mark;
            subjectsInTerm++;
            const result = {
              subject,
              marks: mark,
              total: 100,
              percentage: mark,
              classPosition: student.Rank_in_Class || Math.floor(Math.random() * 5) + 1,
              sectionPosition: student.Rank_in_Class || Math.floor(Math.random() * 5) + 1,
              type,
              academicYear
            };
            examResults.push(result);

            if (term === 'Term1') { // Assuming Term1 are test reports
                testReports.push({ subject, score: mark });
            }
          }
        });
        if (subjectsInTerm > 0) {
            marks[academicYear] = parseFloat((totalMarksForTerm / subjectsInTerm).toFixed(2));
        }
      });

      const newStudent = new Student({
        name: `${student.First_Name} ${student.Last_Name}`,
        uniqueId: student.Student_ID,
        admissionYear: admissionYear,
        cityCode: student.City ? student.City.substring(0, 3).toLowerCase() : null,
        gender: student.Gender,
        dob: dob,
        age: age,
        admissionId: student.Admission_Number,
        bloodGroup: student.Blood_Group,
        email: student.Email,
        contact: student.Phone,
        fatherName: student.Father_Name,
        parentContact: student.Guardian_Phone,
        grade: student.Class,
        section: student.Section,
        rollNumber: student.Roll_Number,
        address: student.Address,
        remarks: student.Remarks,
        performanceScore: student.Overall_Percentage,
        attendance: student.Attendance_Total_Percentage,
        overallPercentage: student.Overall_Percentage,
        classPosition: student.Rank_in_Class || Math.floor(Math.random() * 5) + 1,
        sectionPosition: student.Rank_in_Class || Math.floor(Math.random() * 5) + 1,
        schoolPerformanceRange: student.School_Performance_Range || 'Top 10%', // Use from Excel if available
        marks,
        testReports,
        complaints: [],
        awards: student.Awards ? student.Awards.split(',').map(s => s.trim()) : [],
        examResults,
      });

      await newStudent.save();
      console.log(`Added student: ${newStudent.name}`);
    }
    console.log('All students imported successfully!');
  } catch (error) {
    console.error('Error importing students:', error);
  } finally {
    mongoose.connection.close();
  }
};

importStudents();
