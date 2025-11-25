const express = require('express');
const mongoose = require('mongoose');
const Billing = require('../models/Billing');
const Earning = require('../models/Earning');
const Student = require('../models/Student');
const { sendSms, sendWhatsAppMessage } = require('../utils/notifications');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const router = express.Router();
const BillingTemplate = require('../models/BillingTemplate');

// Generate bills from template
router.post('/generate-from-template', async (req, res) => {
  try {
    const { 
      templateId, 
      studentIds, 
      department, 
      classFilter, 
      dueDate, 
      amount, 
      generationType,
      departmentFilter,
      studentIds: studentIdsParam
    } = req.body;

    // Validate required fields based on generation type
    if (!generationType) {
      return res.status(400).json({ 
        error: 'Missing required field: generationType is required' 
      });
    }

    // Validate based on generation type
    const validationErrors = validateGenerationType(generationType, req.body);
    if (validationErrors) {
      return res.status(400).json({ error: validationErrors });
    }

    const template = await BillingTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Billing template not found' });
    }

    const students = await getStudentsByGenerationType(generationType, req.body);
    if (students.length === 0) {
      return res.status(404).json({ error: 'No students found for the given criteria' });
    }

    const bills = students.map(student => {
      let description = template.description;
      if (template.props && template.props.length > 0) {
        template.props.forEach(prop => {
          const regex = new RegExp(`\\\\${prop}`, 'g');
          description = description.replace(regex, student[prop] || '');
        });
      }
      return {
        student: student._id,
        template: template._id,
        dueDate: new Date(dueDate),
        description,
        amount,
      };
    });

    const insertedBills = await Billing.insertMany(bills);

    res.json({ 
      message: `${insertedBills.length} bills generated successfully`, 
      bills: insertedBills 
    });
 } catch (error) {
    console.error('Error generating bills from template:', error);
    res.status(500).json({ error: 'Failed to generate bills from template' });
  }
});

// Generate bills for students
router.post('/generate', async (req, res) => {
  try {
    const { 
      studentIds, 
      departments, 
      allDepartments, 
      items, 
      dueDate, 
      generatedBy, 
      description, 
      startDate, 
      endDate, 
      classFilter,
      generationType,
      departmentFilter,
      studentIds: studentIdsParam
    } = req.body;

    // Validate required fields
    if (!generationType) {
      return res.status(400).json({ 
        error: 'Missing required field: generationType is required' 
      });
    }

    if (!generatedBy) {
      return res.status(400).json({ 
        error: 'Missing required field: generatedBy is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(generatedBy)) {
      return res.status(400).json({ 
        error: 'Invalid generatedBy: must be a valid user ID' 
      });
    }

    // Validate based on generation type
    const validationErrors = validateGenerationType(generationType, req.body, true);
    if (validationErrors) {
      return res.status(400).json({ error: validationErrors });
    }

    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    }

    const students = await getStudentsByGenerationType(generationType, req.body);
    if (students.length === 0) {
      return res.status(404).json({ error: 'No students found for the given criteria' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Determine department based on generation type
    let billDepartment = 'general';
    if (generationType === 'department' && departments) {
      billDepartment = departments.join(', ');
    } else if (generationType === 'NonId' && departments) {
      billDepartment = departments.join(', ');
    }

    const bills = generateBillsByDateRange(
      students, 
      items, 
      totalAmount, 
      billDepartment, 
      generatedBy, 
      description, 
      dueDate, 
      startDate, 
      endDate
    );

    const insertedBills = await Billing.insertMany(bills);

    // Send notifications
    await sendBillNotifications(insertedBills);

    res.json({ 
      message: `${insertedBills.length} bills generated successfully`, 
      bills: insertedBills 
    });
  } catch (error) {
    console.error('Error generating bills:', error);
    res.status(50).json({ error: 'Failed to generate bills' });
  }
});

// Get all bills
router.get('/', async (req, res) => {
  try {
    const { student, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = buildBillQuery({ student, status, startDate, endDate });
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bills = await Billing.find(query)
      .populate('student', 'name admissionId')
      .populate('generatedBy', 'name email')
      .populate('template')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Billing.countDocuments(query);

    res.json({
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get a single bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('student', 'name admissionId')
      .populate('generatedBy', 'name email')
      .populate('template');
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// Update bill status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, modeOfPayment } = req.body;

    if (!['pending', 'paid', 'overdue'].includes(status)) {
      return res.status(40).json({ error: 'Invalid status' });
    }

    const bill = await Billing.findByIdAndUpdate(id, { status }, { new: true })
      .populate('student', 'name admissionId')
      .populate('generatedBy', 'name email');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // If bill is paid, create a corresponding entry in earnings
    if (status === 'paid') {
      if (!modeOfPayment) {
        return res.status(400).json({ error: 'Mode of payment is required' });
      }

      const earning = new Earning({
        type: 'revenue',
        requestType: `${bill.department} fee`,
        earnings: bill.amount,
        date: new Date(),
        month: new Date().toLocaleString('default', { month: 'long' }),
        description: `Payment for bill ID: ${bill._id}`,
        status: 'approved',
        studentUniqueId: bill.student.admissionId,
        name: `Fee from ${bill.student.name}`,
        time: new Date().toLocaleTimeString(),
        modeOfPayment,
        requestedBy: bill.generatedBy._id,
      });
      await earning.save();
    }

    res.json(bill);
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({ error: 'Failed to update bill status' });
  }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Billing.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// Get billing summary
router.get('/summary', async (req, res) => {
  try {
    const { department, month, status } = req.query;
    const query = buildSummaryQuery({ department, month, status });

    const totalBilled = await Billing.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidQuery = { ...query, status: 'paid' };
    const totalPaid = await Billing.aggregate([
      { $match: paidQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingQuery = { ...query, status: 'pending' };
    const pendingBills = await Billing.countDocuments(pendingQuery);

    const overdueQuery = { ...query, status: 'overdue' };
    const overdueBills = await Billing.countDocuments(overdueQuery);

    res.json({
      totalBilled: totalBilled.length > 0 ? totalBilled[0].total : 0,
      totalPaid: totalPaid.length > 0 ? totalPaid[0].total : 0,
      pendingBills,
      overdueBills,
    });
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    res.status(500).json({ error: 'Failed to fetch billing summary' });
 }
});

// Export bills
router.get('/export', async (req, res) => {
  try {
    const { department, month, status, format = 'json' } = req.query;
    const query = buildExportQuery({ department, month, status });

    const bills = await Billing.find(query)
      .populate('student', 'name admissionId')
      .populate('generatedBy', 'name email');

    if (format === 'csv') {
      return exportAsCSV(res, bills);
    }

    if (format === 'pdf') {
      return exportAsPDF(res, bills);
    }

    res.json(bills);
 } catch (error) {
    console.error('Error exporting bills:', error);
    res.status(500).json({ error: 'Failed to export bills' });
  }
});

// Helper functions
function validateGenerationType(generationType, body, isAddition = false) {
  const { 
    templateId, 
    dueDate, 
    amount, 
    items, 
    classFilter, 
    studentIds: studentIdsParam,
    departments,
    studentIds
  } = body;

  switch (generationType) {
    case 'department':
      if (isAddition) {
        if (!items || !departments) {
          return 'Missing required fields for department generation: items, departments are required';
        }
      } else {
        if (!templateId || !dueDate || !amount) {
          return 'Missing required fields for department generation: templateId, dueDate, amount are required';
        }
      }
      break;
    case 'class':
      if (isAddition) {
        if (!items || !classFilter) {
          return 'Missing required fields for class generation: items, classFilter are required';
        }
      } else {
        if (!templateId || !dueDate || !amount || !classFilter) {
          return 'Missing required fields for class generation: templateId, dueDate, amount, classFilter are required';
        }
      }
      break;
    case 'student':
      if (isAddition) {
        if (!items || !studentIdsParam) {
          return 'Missing required fields for student generation: items, studentIds are required';
        }
      } else {
        if (!templateId || !dueDate || !amount || !studentIdsParam) {
          return 'Missing required fields for student generation: templateId, dueDate, amount, studentIds are required';
        }
      }
      break;
    case 'NonId':
      if (isAddition) {
        if (!items) {
          return 'Missing required field for NonId generation: items are required';
        }
        if (!classFilter && !studentIds) {
          return 'Missing required filter for NonId generation: classFilter or studentIds are required';
        }
      } else {
        if (!templateId || !dueDate || !amount) {
          return 'Missing required fields for NonId generation: templateId, dueDate, amount are required';
        }
      }
      break;
    default:
      return 'Invalid generationType. Must be one of: department, class, student, NonId';
  }
  return null;
}

async function getStudentsByGenerationType(generationType, body) {
  const { 
    departmentFilter, 
    department, 
    classFilter, 
    studentIds, 
    departments 
  } = body;

  switch (generationType) {
    case 'department':
      if (departmentFilter && departmentFilter.departments) {
        return await Student.find({ 
          department: { $in: departmentFilter.departments } 
        });
      } else if (department) {
        return await Student.find({ department: department });
      }
      break;
    case 'class':
      if (classFilter) {
        const { className, rollNumber } = classFilter;
        if (rollNumber) {
          return await Student.find({ grade: className, rollNumber: rollNumber });
        } else {
          return await Student.find({ grade: className });
        }
      }
      break;
    case 'student':
      if (studentIds) {
        return await Student.find({ '_id': { $in: studentIds } });
      }
      break;
    case 'NonId':
      if (classFilter) {
        const { className, rollNumber } = classFilter;
        if (rollNumber) {
          return await Student.find({ grade: className, rollNumber: rollNumber });
        } else {
          return await Student.find({ grade: className });
        }
      } else if (studentIds) {
        return await Student.find({ '_id': { $in: studentIds } });
      }
      break;
  }
  return [];
}

function generateBillsByDateRange(students, items, totalAmount, department, generatedBy, description, dueDate, startDate, endDate) {
  const bills = [];
  
  if (startDate && endDate) {
    // Generate bills for each date in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const student of students) {
      for (const date of dates) {
        const bill = new Billing({
          student: student._id,
          department: department,
          items,
          amount: totalAmount,
          dueDate: date,
          generatedBy,
          description: description,
        });
        bills.push(bill);
      }
    }
 } else {
    // Generate single bill with original due date
    for (const student of students) {
      const bill = new Billing({
        student: student._id,
        department: department,
        items,
        amount: totalAmount,
        dueDate: dueDate || new Date(),
        generatedBy,
        description: description,
      });
      bills.push(bill);
    }
  }

  return bills;
}

async function sendBillNotifications(bills) {
  for (const bill of bills) {
    const student = await Student.findById(bill.student);
    if (student && student.parentContact) {
      const message = `Dear Parent, a new bill of ${bill.amount} has been generated for ${student.name} with a due date of ${bill.dueDate.toLocaleDateString()}.`;
      // Choose one or both methods to send notifications
      // await sendSms(student.parentContact, message);
      // await sendWhatsAppMessage(student.parentContact, message);
    }
  }
}

function buildBillQuery({ student, status, startDate, endDate }) {
  const query = {};
  if (student) query.student = student;
  if (status) query.status = status;

  if (startDate && endDate) {
    query.dueDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
 return query;
}

function buildSummaryQuery({ department, month, status }) {
  const query = {};
  if (department) query.department = department;
 if (status) query.status = status;
  if (month) {
    const year = new Date().getFullYear();
    const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    query.dueDate = { $gte: startDate, $lte: endDate };
  }
  return query;
}

function buildExportQuery({ department, month, status }) {
  const query = {};
  if (department) query.department = department;
 if (status) query.status = status;
 if (month) {
    const year = new Date().getFullYear();
    const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    query.dueDate = { $gte: startDate, $lte: endDate };
  }
  return query;
}

function exportAsCSV(res, bills) {
  const fields = ['student.name', 'student.admissionId', 'department', 'amount', 'dueDate', 'status', 'generatedBy.name'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(bills);
  res.header('Content-Type', 'text/csv');
 res.attachment('billing-report.csv');
  return res.send(csv);
}

function exportAsPDF(res, bills) {
  const doc = new PDFDocument();
  let filename = 'billing-report.pdf';
  filename = encodeURIComponent(filename);
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.fontSize(16).text('Billing Report', { align: 'center' });
 doc.moveDown();

 bills.forEach(bill => {
    doc.fontSize(12).text(`Student: ${bill.student.name} (${bill.student.admissionId})`);
    doc.text(`Department: ${bill.department}`);
    doc.text(`Amount: ${bill.amount}`);
    doc.text(`Due Date: ${bill.dueDate.toLocaleDateString()}`);
    doc.text(`Status: ${bill.status}`);
    doc.text(`Generated By: ${bill.generatedBy.name}`);
    doc.moveDown();
  });

  doc.pipe(res);
 doc.end();
  return;
}

module.exports = router;
