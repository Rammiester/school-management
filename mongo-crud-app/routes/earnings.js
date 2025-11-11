// routes/earnings.js

const express = require('express');
const Earning = require('../models/Earning');
const Student = require('../models/Student');
const router = express.Router();

// Add a revenue/expense entry (with studentUniqueId handling)
router.post('/', async (req, res) => {
  try {
    const earning = new Earning({ ...req.body, status: "pending" });
    await earning.save();

    // If fee payment, update student payments array
    if (req.body.studentUniqueId) {
      await Student.findOneAndUpdate(
        { uniqueId: req.body.studentUniqueId },
        {
          $push: {
            payments: {
              amount: req.body.earnings,
              date: req.body.date,
              description: req.body.description,
              revenueId: earning._id
            }
          }
        }
      );
    }
    res.status(201).json({ message: "Entry submitted, pending chairman approval", earning });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all earnings raised by the currently logged-in user (admin/teacher)
router.get('/my-requests', async (req, res) => {
  try {
    // Assuming you pass user info in req.user (with email or id)
    // If not using authentication middleware, use req.query.email
    const email = req.user?.email || req.query.email; // fallback to query param
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    const myRequests = await Earning.find({ createdBy: email }).sort({ date: -1 });
    res.json(myRequests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all pending earnings (with optional filtering)
router.get('/pending-earnings', async (req, res) => {
  try {
    // Optional filters: createdBy, minAmount, maxAmount, from, to
    const { createdBy, minAmount, maxAmount, from, to, page = 1, limit = 10 } = req.query;
    const query = { status: 'pending' };

    if (createdBy) query.createdBy = createdBy;
    if (minAmount) query.earnings = { $gte: Number(minAmount) };
    if (maxAmount) query.earnings = { ...query.earnings, $lte: Number(maxAmount) };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const skip = (pageInt - 1) * limitInt;

    const pendingEarnings = await Earning.find(query).sort({ date: -1 }).skip(skip).limit(limitInt);
    const total = await Earning.countDocuments(query);

    // Return with success and data structure for frontend consistency
    res.json({
      success: true,
      data: pendingEarnings,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: total,
        totalPages: Math.ceil(total / limitInt)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH approve a single earning
router.patch('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const updated = await Earning.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH decline a single earning
router.patch('/:id/decline', async (req, res) => {
  try {
    const { declinedBy, declineReason } = req.body;
    const updated = await Earning.findByIdAndUpdate(
      req.params.id,
      { status: 'declined', declinedBy, declineReason },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH approve all pending earnings
router.patch('/bulk-approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const result = await Earning.updateMany(
      { status: 'pending' },
      { $set: { status: 'approved', approvedBy } }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH decline all pending earnings
router.patch('/bulk-decline', async (req, res) => {
  try {
    const { declinedBy, declineReason } = req.body;
    const result = await Earning.updateMany(
      { status: 'pending' },
      { $set: { status: 'declined', declinedBy, declineReason } }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// (Optional) GET earning by ID
router.get('/:id', async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id);
    if (!earning) return res.status(404).json({ error: 'Not found' });
    res.json(earning);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all earnings with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, requestType, startDate, endDate, createdBy } = req.query;
    
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const skip = (pageInt - 1) * limitInt;
    
    let query = {};
    
    // Apply filters only if they exist and are not 'all' or empty
    if (status && status !== 'all' && status !== '') query.status = status;
    if (type && type !== 'all' && type !== '') query.type = type;
    if (requestType && requestType !== 'all' && requestType !== '') query.requestType = requestType;
    if (createdBy && createdBy !== 'all' && createdBy !== '') query.createdBy = createdBy;
    
    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const earnings = await Earning.find(query).sort({ date: -1 }).skip(skip).limit(limitInt);
    const total = await Earning.countDocuments(query);
    
    res.json({
      success: true,
      data: earnings,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: total,
        totalPages: Math.ceil(total / limitInt)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a single earning
router.delete('/:id', async (req, res) => {
  try {
    const earning = await Earning.findByIdAndDelete(req.params.id);
    if (!earning) return res.status(404).json({ error: 'Earning not found' });
    res.json({ message: 'Earning deleted successfully', earning });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
