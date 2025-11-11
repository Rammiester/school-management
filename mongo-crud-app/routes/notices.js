//routes/notices.js

const express = require('express');
const Notice = require('../models/Notice');
const router = express.Router();

// CRUD endpoints for notices
// POST /api/notices
router.post('/', async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices/by-date
// Filter notices by a specific date to show notices valid for that date
router.get('/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameter' });
    }

    // Find notices that should be visible on the target date
    const notices = await Notice.find({
      $or: [
        // No date range specified - show always
        { startDate: null, endDate: null },
        { startDate: { $exists: false }, endDate: { $exists: false } },
        // Only start date - show if current date is after or equal to start date
        { startDate: { $lte: targetDate }, endDate: null },
        { startDate: { $lte: targetDate }, endDate: { $exists: false } },
        // Only end date - show if current date is before or equal to end date
        { startDate: null, endDate: { $gte: targetDate } },
        { startDate: { $exists: false }, endDate: { $gte: targetDate } },
        // Both start and end dates - show if current date is within range
        { startDate: { $lte: targetDate }, endDate: { $gte: targetDate } }
      ]
    });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
