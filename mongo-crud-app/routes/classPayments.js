const express = require('express');
const router = express.Router();
const ClassPayment = require('../models/ClassPayment');
const { chairmanMiddleware } = require('../middleware/jwt'); // Import chairman middleware

// Get all classes with their payments (for dashboard)
router.get('/classes-payments', async (req, res) => {
  try {
    // Get all classes from 1 to 12
    const classes = [];
    for (let i = 1; i <= 12; i++) {
      const classPayment = await ClassPayment.findOne({ className: i.toString() });
      if (classPayment) {
        classes.push({
          _id: classPayment._id,
          className: classPayment.className,
          payments: classPayment.payments
        });
      } else {
        // Create default structure for classes that don't have payments yet
        classes.push({
          _id: null,
          className: i.toString(),
          payments: [
            { department: 'Academics', amount: 0, isEditable: true },
            { department: 'Sports', amount: 0, isEditable: true },
            { department: 'Music', amount: 0, isEditable: true },
            { department: 'Dance', amount: 0, isEditable: true },
            { department: 'Art', amount: 0, isEditable: true },
            { department: 'Library', amount: 0, isEditable: true },
            { department: 'Hostel', amount: 0, isEditable: true },
            { department: 'Transport', amount: 0, isEditable: true },
            { department: 'Food', amount: 0, isEditable: true },
            { department: 'Other', amount: 0, isEditable: true }
          ]
        });
      }
    }
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all class payments
router.get('/', async (req, res) => {
  try {
    const classPayments = await ClassPayment.find().sort({ className: 1 });
    res.json(classPayments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class payments for a specific class
router.get('/:className', async (req, res) => {
  try {
    const classPayment = await ClassPayment.findOne({ className: req.params.className });
    if (!classPayment) {
      return res.status(404).json({ message: 'Class payment not found' });
    }
    res.json(classPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update class payments
router.put('/classes-payments/:classId', chairmanMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const { payments } = req.body;

    // Validate payments structure
    if (!Array.isArray(payments)) {
      return res.status(400).json({ message: 'Payments must be an array' });
    }

    // Check if classId is a valid MongoDB ObjectId or a class name
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(classId);
    
    let classPayment;
    if (isValidObjectId) {
      // If it's an ObjectId, find by _id
      classPayment = await ClassPayment.findById(classId);
      if (!classPayment) {
        // If not found, create new with ObjectId as className (this shouldn't happen in practice)
        return res.status(404).json({ message: 'Class payment not found' });
      }
    } else {
      // If it's a class name, find by className
      if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
      classPayment = await ClassPayment.findOne({ className: classId });
      
      if (!classPayment) {
        // Create new if not found
        classPayment = new ClassPayment({
          className: classId,
          payments: payments
        });
      } else {
        // Update existing
        classPayment.payments = payments;
      }
    }

    classPayment.updatedAt = Date.now();
    await classPayment.save();

    res.json(classPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update specific payment for a class
router.put('/classes-payments/:classId/:department', chairmanMiddleware, async (req, res) => {
  try {
    const { classId, department } = req.params;
    const { amount } = req.body;

    // Validate department
    const validDepartments = ['Academics', 'Sports', 'Music', 'Dance', 'Art', 'Library', 'Hostel', 'Transport', 'Food', 'Other'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    // Check if classId is a valid MongoDB ObjectId or a class name
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(classId);
    
    let classPayment;
    if (isValidObjectId) {
      // If it's an ObjectId, find by _id
      classPayment = await ClassPayment.findById(classId);
      if (!classPayment) {
        return res.status(404).json({ message: 'Class payment not found' });
      }
    } else {
      // If it's a class name, find by className
      if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
      classPayment = await ClassPayment.findOne({ className: classId });
      
      if (!classPayment) {
        // Create new class payment with this payment
        classPayment = new ClassPayment({
          className: classId,
          payments: [{
            department,
            amount,
            isEditable: true
          }]
        });
      }
    }

    // Update existing payment or add new payment
    const paymentIndex = classPayment.payments.findIndex(p => p.department === department);
    if (paymentIndex !== -1) {
      classPayment.payments[paymentIndex].amount = amount;
    } else {
      // Add new payment
      classPayment.payments.push({
        department,
        amount,
        isEditable: true
      });
    }
    classPayment.updatedAt = Date.now();
    await classPayment.save();

    res.json(classPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new department to a class
router.post('/classes-payments/:classId/departments', chairmanMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    const { department, amount = 0 } = req.body;

    let classPayment;

    // Check if classId is a valid MongoDB ObjectId or a class name
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(classId);
    
    if (isValidObjectId) {
      // If it's an ObjectId, find by _id
      classPayment = await ClassPayment.findById(classId);
      if (!classPayment) {
        return res.status(404).json({ message: 'Class payment not found' });
      }
    } else {
      // If it's a class name, find by className
      if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
      classPayment = await ClassPayment.findOne({ className: classId });
    }

    // Validate department name
    if (!department || typeof department !== 'string') {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check if department already exists in this class
    const existingDepartment = classPayment.payments.find(p => p.department === department);
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists for this class' });
    }
    
    // Add new department
    classPayment.payments.push({
      department,
      amount,
      isEditable: true
    });
    classPayment.updatedAt = Date.now();
    await classPayment.save();

    res.json(classPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a department from a class
router.delete('/classes-payments/:classId/departments/:department', chairmanMiddleware, async (req, res) => {
  try {
    const { classId, department } = req.params;

    // Validate department name
    if (!department) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check if classId is a valid MongoDB ObjectId or a class name
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(classId);
    
    let classPayment;
    if (isValidObjectId) {
      // If it's an ObjectId, find by _id
      classPayment = await ClassPayment.findById(classId);
      if (!classPayment) {
        return res.status(404).json({ message: 'Class payment not found' });
      }
    } else {
      // If it's a class name, find by className
      if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
      classPayment = await ClassPayment.findOne({ className: classId });
      
      if (!classPayment) {
        return res.status(404).json({ message: 'Class payment not found' });
      }
    }

    // Check if department exists and is not a default department
    const validDepartments = ['Academics', 'Sports', 'Music', 'Dance', 'Art', 'Library', 'Hostel', 'Transport', 'Food', 'Other'];
    if (validDepartments.includes(department)) {
      return res.status(400).json({ message: 'Cannot remove default departments' });
    }

    // Remove department
    const initialLength = classPayment.payments.length;
    classPayment.payments = classPayment.payments.filter(p => p.department !== department);
    classPayment.updatedAt = Date.now();
    await classPayment.save();

    if (classPayment.payments.length === initialLength) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department removed successfully', classPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
