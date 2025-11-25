//routes/students.js
const express = require('express');
const Student = require('../models/Student');
const { authMiddleware, chairmanMiddleware } = require('../middleware/jwt');
const router = express.Router();
const cron = require('node-cron');

let scheduledDate = null;
const assignRollNumbersLogic = async () => {
  try {
    const students = await Student.find().sort({ grade: 1, name: 1 });
    const studentsByGrade = {};
    students.forEach(student => {
      let normalizedGrade = student.grade;
      if (typeof student.grade === 'string') {
        const gradeMatch = student.grade.match(/^(\d{1,2})(st|nd|rd|th)?/i);
        if (gradeMatch) {
          normalizedGrade = gradeMatch[1];
        } else {
          normalizedGrade = student.grade;
        }
      } else if (typeof student.grade === 'number') {
        normalizedGrade = student.grade.toString();
      }
      if (!studentsByGrade[normalizedGrade]) {
        studentsByGrade[normalizedGrade] = [];
      }
      studentsByGrade[normalizedGrade].push(student);
    });
    const updatedStudents = [];
    for (const grade in studentsByGrade) {
      const gradeStudents = studentsByGrade[grade].sort((a, b) => a.name.localeCompare(b.name));
      gradeStudents.forEach((student, index) => {
        student.rollNumber = index + 1;
        updatedStudents.push(student);
      });
    }
    const savePromises = updatedStudents.map(student => {
      return Student.findByIdAndUpdate(student._id, { rollNumber: student.rollNumber }, { new: true });
    });
    await Promise.all(savePromises);
    console.log('Roll numbers assigned successfully.');
    return { success: true, assignedStudents: updatedStudents };
  } catch (err) {
    console.error('Error assigning roll numbers:', err);
    return { success: false, error: err.message };
  }
};

router.post('/schedule-roll-numbers', authMiddleware, chairmanMiddleware, async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required.' });
  }

  scheduledDate = new Date(date);
  const cronString = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;

  cron.schedule(cronString, async () => {
    console.log(`Assigning roll numbers as scheduled on ${scheduledDate}`);
    await assignRollNumbersLogic();
    scheduledDate = null; // Clear the date after the job runs
  });

  res.json({ success: true, message: `Roll number assignment scheduled for ${scheduledDate}` });
});

router.get('/schedule-roll-numbers', authMiddleware, chairmanMiddleware, (req, res) => {
   res.json({ success: true, date: scheduledDate });
});

router.delete('/schedule-roll-numbers', authMiddleware, chairmanMiddleware, (req, res) => {
   scheduledDate = null;
   res.json({ success: true, message: 'Scheduled roll number assignment has been canceled.' });
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let sort = {};
    if (req.query.sortField && req.query.sortOrder) {
      let sortFields = req.query.sortField;
      let sortOrders = req.query.sortOrder;
      
      if (typeof sortFields === 'string') {
        sortFields = sortFields.includes(',') ? sortFields.split(',') : [sortFields];
      } else if (!Array.isArray(sortFields)) {
        sortFields = [sortFields];
      }
      
      if (typeof sortOrders === 'string') {
        sortOrders = sortOrders.includes(',') ? sortOrders.split(',') : [sortOrders];
      } else if (!Array.isArray(sortOrders)) {
        sortOrders = [sortOrders];
      }
      
      const validSortFields = ['name', 'grade', 'section', 'uniqueId', 'parentContact', 'attendance', 'createdAt', 'admissionYear', 'rollNumber'];
      
      for (let i = 0; i < sortFields.length && i < sortOrders.length; i++) {
        const sortField = sortFields[i].trim();
        const sortOrder = sortOrders[i].trim();
        
        if (validSortFields.includes(sortField)) {
          const orderValue = sortOrder === 'descend' ? -1 : 1;
          sort[sortField] = orderValue;
        } else {
          if (sortFields.length === 1) {
            sort.createdAt = -1;
            break;
          }
        }
      }
      
      if (Object.keys(sort).length === 0) {
        sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const total = await Student.countDocuments({});

    const pipeline = [];
    
    if (Object.keys(sort).length > 0) {
      pipeline.push({ $sort: sort });
    }
    
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const students = await Student.aggregate(pipeline);

    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/grade/:grade', async (req, res) => {
  try {
    const { grade } = req.params;
    
    let gradePattern;
    
    if (grade.endsWith('st') || grade.endsWith('nd') || grade.endsWith('rd') || grade.endsWith('th')) {
        const numberPart = grade.slice(0, -2);
      gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
    } else {
        gradePattern = new RegExp(`^${grade}(st|nd|rd|th)?$`, 'i');
    }
    
    const students = await Student.find({ grade: gradePattern }, { name: 1, _id: 0 });
    const studentNames = students.map(student => student.name);
    res.json(studentNames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/grade/:grade/rollnumber/:rollNumber', async (req, res) => {
  try {
    const { grade, rollNumber } = req.params;
    
    let gradePattern;
    if (grade.endsWith('st') || grade.endsWith('nd') || grade.endsWith('rd') || grade.endsWith('th')) {
      const numberPart = grade.slice(0, -2);
      gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
    } else {
      gradePattern = new RegExp(`^${grade}(st|nd|rd|th)?$`, 'i');
    }
    
    const student = await Student.findOne({ 
      grade: gradePattern, 
      rollNumber: parseInt(rollNumber) 
    }, {
      name: 1,
      rollNumber: 1,
      grade: 1,
      _id: 0
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Return in the requested format
    res.json({
      "Name": student.name,
      "Roll Number": student.rollNumber,
      "Grade": student.grade
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// updated route for searching by name
router.get('/grade/:grade/name/:name', async (req, res) => {
  try {
    const { grade, name } = req.params;
    
    let gradePattern;
    if (grade.endsWith('st') || grade.endsWith('nd') || grade.endsWith('rd') || grade.endsWith('th')) {
      const numberPart = grade.slice(0, -2);
      gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
    } else {
      gradePattern = new RegExp(`^${grade}(st|nd|rd|th)?$`, 'i');
    }
    
    function escapeRegex(str){ return str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
    const students = await Student.find({
      grade: gradePattern,
      name: new RegExp(`^${escapeRegex(name.trim())}$`, 'i')
    });
    // Return only the roll numbers of matching students
    const rollNumbers = students.map(student => student.rollNumber);
    res.json(rollNumbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/grade/:grade/students-with-roll', async (req, res) => {
  try {
    const { grade } = req.params;
    
    let gradePattern;
    if (grade.endsWith('st') || grade.endsWith('nd') || grade.endsWith('rd') || grade.endsWith('th')) {
      const numberPart = grade.slice(0, -2);
      gradePattern = new RegExp(`^${numberPart}(st|nd|rd|th)?$`, 'i');
    } else {
      gradePattern = new RegExp(`^${grade}(st|nd|rd|th)?$`, 'i');
    }
    
    const students = await Student.find({ 
      grade: gradePattern 
    }, {
      name: 1,
      rollNumber: 1,
      _id: 1
    }).sort({ rollNumber: 1 });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { uniqueId: { $regex: q, $options: 'i' } },
        { parentContact: { $regex: q, $options: 'i' } },
        { contact: { $regex: q, $options: 'i' } }
      ]
    };

    let sort = {};
    if (req.query.sortField && req.query.sortOrder) {
      let sortFields = req.query.sortField;
      let sortOrders = req.query.sortOrder;
      
      if (typeof sortFields === 'string') {
        sortFields = sortFields.includes(',') ? sortFields.split(',') : [sortFields];
      } else if (!Array.isArray(sortFields)) {
        sortFields = [sortFields];
      }
      
      if (typeof sortOrders === 'string') {
        sortOrders = sortOrders.includes(',') ? sortOrders.split(',') : [sortOrders];
      } else if (!Array.isArray(sortOrders)) {
        sortOrders = [sortOrders];
      }
      
      const validSortFields = ['name', 'grade', 'section', 'uniqueId', 'parentContact', 'attendance', 'createdAt', 'admissionYear', 'rollNumber'];
      
      for (let i = 0; i < sortFields.length && i < sortOrders.length; i++) {
        const sortField = sortFields[i].trim();
        const sortOrder = sortOrders[i].trim();
        
        if (validSortFields.includes(sortField)) {
          const orderValue = sortOrder === 'descend' ? -1 : 1;
          sort[sortField] = orderValue;
        } else {
          if (sortFields.length === 1) {
            sort.createdAt = -1;
            break;
          }
        }
      }
      
      if (Object.keys(sort).length === 0) {
        sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const searchPipeline = [];
    
    searchPipeline.push({ $match: query });
    
    if (Object.keys(sort).length > 0) {
      searchPipeline.push({ $sort: sort });
    }

    const students = await Student.aggregate(searchPipeline);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function generateNextUniqueId(cityCode, year) {
  const regex = new RegExp(`^${cityCode}${year}(\\d{2})$`);
  const latest = await Student.find({ uniqueId: { $regex: regex } })
    .sort({ uniqueId: -1 })
    .limit(1);
  let nextNum = 1;
  if (latest.length > 0) {
    const lastId = latest[0].uniqueId;
    const lastSerial = parseInt(lastId.slice(-2));
    nextNum = lastSerial + 1;
  }
  const serialStr = nextNum.toString().padStart(2, '0');
  return `${cityCode}${year}${serialStr}`;
}

router.post('/', async (req, res) => {
  try {
    const { cityCode } = req.body;
    const admissionYear = req.body.admissionYear || new Date().getFullYear();

    const uniqueId = await generateNextUniqueId(cityCode, admissionYear);

    const exists = await Student.findOne({ uniqueId });
    if (exists) {
      const suggestedId = await generateNextUniqueId(cityCode, admissionYear);
      return res.status(400).json({
        code: 'DUPLICATE_ID',
        error: "Duplicate student ID detected.",
        suggestedId
      });
    }

    const student = new Student({
      ...req.body,
      admissionYear,
      uniqueId,
      cityCode
    });
    await student.save();
    res.status(201).json({ message: "Student added!", student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/suggest-id', async (req, res) => {
  const { cityCode, year } = req.query;
  if (!cityCode || !year) return res.status(400).json({ error: "cityCode and year are required" });
  const suggestedId = await generateNextUniqueId(cityCode, parseInt(year));
  res.json({ suggestedId });
});

router.get('/gender-distribution', async (req, res) => {
  try {
    const genderDistribution = await Student.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count"
        }
      }
    ]);

    const distributionMap = {};
    genderDistribution.forEach(item => {
      distributionMap[item.name] = item.value;
    });

    const result = [
      { name: "Male", value: distributionMap["Male"] || 0 },
      { name: "Female", value: distributionMap["Female"] || 0 },
      { name: "Other", value: distributionMap["Other"] || 0 }
    ];

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/exam-results', async (req, res) => {
  try {
    const examResults = await Student.aggregate([
      { $unwind: "$examResults" },
      {
        $group: {
          _id: {
            exam: "$examResults.exam",
            type: "$examResults.type",
            status: "$examResults.status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          exam: { $ifNull: ["$_id.exam", "$_id.type"] },
          status: "$_id.status",
          count: "$count"
        }
      }
    ]);

    const examMap = {};
    examResults.forEach(item => {
      const examName = item.exam || "Unknown";
      if (!examMap[examName]) {
        examMap[examName] = {
          name: examName,
          Pass: 0,
          Fail: 0,
          NotAttended: 0,
        };
      }
      if (item.status === "Pass") examMap[examName].Pass = item.count;
      else if (item.status === "Fail") examMap[examName].Fail = item.count;
      else examMap[examName].NotAttended = item.count;
    });

    const result = Object.values(examMap);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/assign-roll-numbers', authMiddleware, chairmanMiddleware, async (req, res) => {
  const result = await assignRollNumbersLogic();
  if (result.success) {
    res.json({
      success: true,
      message: "Roll numbers assigned successfully",
      assignedStudents: result.assignedStudents
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error,
      message: "Failed to assign roll numbers"
    });
  }
});

module.exports = router;
