const express = require("express");
const router = express.Router();
const Holiday = require("../models/Holiday");
const User = require("../models/User"); // Assuming you have a User model
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");

// @route   GET /api/holidays
// @desc    Get all holidays
// @access  Public
router.get("/", async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/holidays
// @desc    Add a new holiday
// @access  Private (add authentication middleware later)
router.post("/", async (req, res) => {
  const { date, description } = req.body;

  try {
    const newHoliday = new Holiday({
      date,
      description,
    });

    const holiday = await newHoliday.save();
    res.json(holiday);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/holidays/:id
// @desc    Delete a holiday
// @access  Private (add authentication middleware later)
router.delete("/:id", async (req, res) => {
  try {
    let holiday = await Holiday.findById(req.params.id);

    if (!holiday) return res.status(404).json({ msg: "Holiday not found" });

    await Holiday.findByIdAndRemove(req.params.id);

    res.json({ msg: "Holiday removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/holidays/users-without-leave
// @desc    Get users who have not taken any holiday (and haven't checked in yet)
// @access  Private (for chairman)
router.get("/users-without-leave", async (req, res) => {
  try {
    // Get all teachers and staff members
    const users = await User.find({ role: { $in: ['teacher', 'staff'] } });
    
    // Get all leave requests to determine who has taken leave
    const leaveRequests = await Leave.find({ status: 'approved' });
    
    // Get all attendance records to determine who has checked in
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Create a set of user IDs who have checked in today
    const checkedInUserIds = new Set(attendanceRecords.map(record => record.userId.toString()));
    
    // Filter users who:
    // 1. Are teachers or staff
    // 2. Have not taken approved leave
    // 3. Have not checked in today (or haven't checked in at all)
    
    const usersWithoutLeave = users.filter(user => {
      // Check if user has any approved leave
      const hasApprovedLeave = leaveRequests.some(leave => 
        leave.userId.toString() === user._id.toString() && 
        leave.status === 'approved'
      );
      
      // Check if user has checked in today
      const hasCheckedIn = checkedInUserIds.has(user._id.toString());
      
      // User qualifies if they haven't taken approved leave AND haven't checked in
      return !hasApprovedLeave && !hasCheckedIn;
    });
    
    res.json(usersWithoutLeave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/holidays/leave
// @desc    Apply for leave (for staff and teachers)
// @access  Private
router.post("/leave", async (req, res) => {
  const { userId, userName, userEmail, role, startDate, endDate, reason } = req.body;

  try {
    // Validate role
    if (role !== 'teacher' && role !== 'staff') {
      return res.status(400).json({ msg: "Invalid role. Must be 'teacher' or 'staff'" });
    }

    // Create new leave request
    const newLeave = new Leave({
      userId,
      userName,
      userEmail,
      role,
      startDate,
      endDate,
      reason
    });

    const leave = await newLeave.save();
    res.status(201).json(leave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/holidays/leave
// @desc    Get all leave requests
// @access  Private (for chairman)
router.get("/leave", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/holidays/leave/user/:userId
// @desc    Get leave requests for a specific user
// @access  Private
router.get("/leave/user/:userId", async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/holidays/leave/:id
// @desc    Update leave request status (for chairman)
// @access  Private
router.put("/leave/:id", async (req, res) => {
  const { status } = req.body;

  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ msg: "Leave request not found" });
    }

    res.json(leave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
