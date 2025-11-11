// routes/dashboard.js
const express = require('express');
const Student = require('../models/Student');
const User    = require('../models/User');
const Event   = require('../models/Event');
const Notice  = require('../models/Notice');
const Earning = require('../models/Earning');
const router  = express.Router();

router.post('/', async (req, res) => {
  const { role } = req.body;

  // common stats
  const studentsCount = await Student.countDocuments();
  const teachersCount = await User.countDocuments({ role: 'teacher' });
  const staffCount    = await User.countDocuments({ role: 'staff' });
  const events        = await Event.find().sort({ date: -1 }).limit(5);
  const notices       = await Notice.find().sort({ date: -1 }).limit(5);
  const pendingCount  = await Earning.countDocuments({ status: 'pending' });

  // build response per role
  let payload = {
    studentsCount,
    teachersCount,
    staffCount,
    events,
    notices,
  };

  if (role === 'chairman') {
    const allEarnings = await Earning.find({ status: 'approved' });
    payload.earnings = {
      totalEarnings:  allEarnings.reduce((a,e) => a+e.earnings,0),
      totalExpenses:  allEarnings.reduce((a,e) => a+e.expenses,0),
      earningsData:   allEarnings,
    };
    payload.notifications = { pendingEarnings: pendingCount };
  }
  else if (role === 'admin') {
    // admin sees no earnings data
    payload.canAddRevenue = true;
  }
  else if (role === 'teacher') {
    // teachers see events, notices
  }
  // users see only studentsCount

  res.json(payload);
});

module.exports = router;
