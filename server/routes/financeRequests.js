const express = require('express');
const router = express.Router();
const Earning = require('../models/Earning');
const { authMiddleware } = require('../middleware/jwt');

// Create a new finance request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requestedBy: req.user.id
    };

    const financeRequest = new Earning(requestData);
    await financeRequest.save();
    
    res.status(201).json({
      success: true,
      data: financeRequest,
      message: 'Finance request created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all finance requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const requests = await Earning.find()
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Earning.countDocuments();
    
    res.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get pending requests (for chairman review)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const pendingRequests = await Earning.find({ status: 'pending' })
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Earning.countDocuments({ status: 'pending' });
    
    res.json({
      success: true,
      data: pendingRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get finance statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const approvedRequests = await Earning.find({ status: 'approved' });
    
    const totalRevenue = approvedRequests
      .filter(req => req.type === 'revenue')
      .reduce((sum, req) => sum + req.earnings, 0);
    
    const totalExpense = approvedRequests
      .filter(req => req.type === 'expense')
      .reduce((sum, req) => sum + req.earnings, 0);
    
    const netBalance = totalRevenue - totalExpense;
    
    const pendingRequests = await Earning.countDocuments({ status: 'pending' });
    
    const monthlyStats = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Get last 6 months of data for charts
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = { revenue: 0, expense: 0 };
    }
    
    // Calculate monthly stats for approved requests
    approvedRequests.forEach(req => {
      const reqDate = new Date(req.createdAt);
      const monthKey = `${reqDate.getFullYear()}-${String(reqDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyStats[monthKey]) {
        if (req.type === 'revenue') {
          monthlyStats[monthKey].revenue += req.earnings;
        } else {
          monthlyStats[monthKey].expense += req.earnings;
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpense,
        netBalance,
        pendingRequests,
        monthlyStats: Object.entries(monthlyStats).map(([month, stats]) => ({ month, ...stats }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Review a finance request (approve/reject)
router.put('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const financeRequest = await Earning.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        reviewNotes: reviewNotes || '',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('requestedBy', 'name email');

    if (!financeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Finance request not found'
      });
    }

    res.json({
      success: true,
      data: financeRequest,
      message: `Request ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a finance request
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const financeRequest = await Earning.findByIdAndDelete(req.params.id);
    
    if (!financeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Finance request not found'
      });
    }

    res.json({
      success: true,
      message: 'Finance request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
