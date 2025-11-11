const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const ClassPayment = require('../models/ClassPayment');
const Student = require('../models/Student');
const BillingTemplate = require('../models/BillingTemplate');
const { adminMiddleware } = require('../middleware/jwt');

// Generate bills from class payment configuration
router.post('/generate-from-class-payments', adminMiddleware, async (req, res) => {
  try {
    const { 
      className, 
      departments, 
      dueDate, 
      months = 1,
      description,
      useTemplates = false,
      studentId = null,
      rollNumber = null 
    } = req.body;

    // Validate required fields
    if (!className || !dueDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: className and dueDate are required' 
      });
    }

    // Get class payment configuration
    const classPayment = await ClassPayment.findOne({ 
      className, 
      isActive: true 
    }).populate('defaultTemplate');
    
    if (!classPayment) {
      return res.status(404).json({ 
        error: `No active payment configuration found for class ${className}` 
      });
    }

    // Filter payments by departments if specified
    let paymentsToProcess = classPayment.payments;
    if (departments && departments.length > 0) {
      paymentsToProcess = classPayment.payments.filter(
        payment => departments.includes(payment.department)
      );
    }

    // Calculate total amount
    const totalAmount = paymentsToProcess.reduce(
      (sum, payment) => sum + payment.amount, 0
    );

    if (totalAmount === 0) {
      return res.status(400).json({ 
        error: 'Total amount is 0. Please configure payment amounts first.' 
      });
    }

    // Find students based on criteria
    let query = { class: className };
    if (studentId) {
      query._id = studentId;
    } else if (rollNumber) {
      query.rollNumber = rollNumber;
    }

    const students = await Student.find(query);
    
    if (students.length === 0) {
      return res.status(404).json({ 
        error: 'No students found for the specified criteria' 
      });
    }

    // Generate bills for each student
    const bills = [];
    for (const student of students) {
      for (let month = 0; month < months; month++) {
        const billDueDate = new Date(dueDate);
        billDueDate.setMonth(billDueDate.getMonth() + month);

        // Prepare items with department breakdown
        const items = paymentsToProcess.map(payment => ({
          name: `${payment.department} Fee`,
          amount: payment.amount,
          description: payment.description || `${payment.department} charges for class ${className}`
        }));

        // Create bill description
        let billDescription = description || 
          `Monthly fee for class ${className}${months > 1 ? ` (Month ${month + 1})` : ''}`;
        
        // If using templates and class has default template
        let templateId = null;
        if (useTemplates && classPayment.defaultTemplate) {
          templateId = classPayment.defaultTemplate._id;
          
          // Replace template variables if template exists
          if (classPayment.defaultTemplate.description) {
            billDescription = classPayment.defaultTemplate.description
              .replace(/\{studentName\}/g, student.name)
              .replace(/\{className\}/g, className)
              .replace(/\{month\}/g, billDueDate.toLocaleString('default', { month: 'long' }))
              .replace(/\{year\}/g, billDueDate.getFullYear());
          }
        }

        const bill = new Billing({
          student: student._id,
          template: templateId,
          department: paymentsToProcess.map(p => p.department).join(', '),
          items,
          amount: totalAmount,
          dueDate: billDueDate,
          description: billDescription,
          generatedBy: req.user.id,
          status: 'pending',
          // Add metadata for tracking
          metadata: {
            generatedFrom: 'classPayment',
            className,
            month: month + 1,
            totalMonths: months
          }
        });

        bills.push(bill);
      }
    }

    // Save all bills
    const savedBills = await Billing.insertMany(bills);

    // Populate student details for response
    const populatedBills = await Billing.find({
      _id: { $in: savedBills.map(b => b._id) }
    })
    .populate('student', 'name admissionId rollNumber class')
    .populate('template', 'name');

    res.json({
      success: true,
      message: `Successfully generated ${savedBills.length} bills for ${students.length} students`,
      summary: {
        totalBills: savedBills.length,
        totalStudents: students.length,
        totalAmount: totalAmount * students.length * months,
        className,
        departments: paymentsToProcess.map(p => p.department)
      },
      bills: populatedBills
    });

  } catch (error) {
    console.error('Error generating bills from class payments:', error);
    res.status(500).json({ 
      error: 'Failed to generate bills from class payments',
      details: error.message 
    });
  }
});

// Get class payment summary for bill generation preview
router.get('/preview/:className', async (req, res) => {
  try {
    const { className } = req.params;
    const { departments } = req.query;

    const classPayment = await ClassPayment.findOne({ 
      className, 
      isActive: true 
    }).populate('defaultTemplate');

    if (!classPayment) {
      return res.status(404).json({ 
        error: `No active payment configuration found for class ${className}` 
      });
    }

    // Filter by departments if specified
    let payments = classPayment.payments;
    if (departments) {
      const deptArray = departments.split(',');
      payments = payments.filter(p => deptArray.includes(p.department));
    }

    // Get student count
    const studentCount = await Student.countDocuments({ class: className });

    // Calculate totals
    const totalPerStudent = payments.reduce((sum, p) => sum + p.amount, 0);
    const breakdown = payments.map(p => ({
      department: p.department,
      amount: p.amount,
      description: p.description || `${p.department} charges`
    }));

    res.json({
      className,
      studentCount,
      totalPerStudent,
      estimatedTotalCollection: totalPerStudent * studentCount,
      breakdown,
      defaultTemplate: classPayment.defaultTemplate ? {
        id: classPayment.defaultTemplate._id,
        name: classPayment.defaultTemplate.name,
        description: classPayment.defaultTemplate.description
      } : null,
      tags: classPayment.tags || []
    });

  } catch (error) {
    console.error('Error getting class payment preview:', error);
    res.status(500).json({ 
      error: 'Failed to get class payment preview',
      details: error.message 
    });
  }
});

// Get billing summary by class
router.get('/summary/by-class', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const matchQuery = {};
    if (status) matchQuery.status = status;
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Billing.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: {
            class: '$studentInfo.class',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.class',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              amount: '$totalAmount'
            }
          },
          totalBills: { $sum: '$count' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      summary,
      query: { startDate, endDate, status }
    });

  } catch (error) {
    console.error('Error getting billing summary by class:', error);
    res.status(500).json({ 
      error: 'Failed to get billing summary',
      details: error.message 
    });
  }
});

module.exports = router;