// mongo-crud-app\routes\attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Student = require('../models/Student');

// Check-in a user
router.post('/checkin', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user || !['teacher', 'staff'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'User has already checked in today' });
    }

    const attendance = new Attendance({
      userId,
      date: today,
      checkInTime: new Date(),
      status: 'checked-in'
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out a user
router.post('/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user || !['teacher', 'staff'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({ message: 'User has already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.status = 'checked-out';

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-in a student
router.post('/student/checkin', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      studentId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Student has already checked in today' });
    }

    const attendance = new Attendance({
      studentId,
      date: today,
      checkInTime: new Date(),
      status: 'checked-in'
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out a student
router.post('/student/checkout', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      studentId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({ message: 'Student has already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.status = 'checked-out';

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Biometric Check-in for users
router.post('/biometric/checkin', async (req, res) => {
  try {
    const { userId, biometricId, biometricType, deviceInfo } = req.body;
    const user = await User.findById(userId);

    if (!user || !['teacher', 'staff'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'User has already checked in today' });
    }

    const attendance = new Attendance({
      userId,
      date: today,
      checkInTime: new Date(),
      status: 'checked-in',
      biometricId,
      biometricVerified: true,
      biometricType,
      deviceInfo
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Biometric Check-out for users
router.post('/biometric/checkout', async (req, res) => {
  try {
    const { userId, biometricId, deviceInfo } = req.body;
    const user = await User.findById(userId);

    if (!user || !['teacher', 'staff'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({ message: 'User has already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.status = 'checked-out';
    attendance.biometricVerified = true;
    attendance.deviceInfo = deviceInfo;

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Biometric Check-in for students
router.post('/student/biometric/checkin', async (req, res) => {
  try {
    const { studentId, biometricType, deviceInfo } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      studentId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Student has already checked in today' });
    }

    const attendance = new Attendance({
      studentId,
      date: today,
      checkInTime: new Date(),
      status: 'checked-in',
      biometricId,
      biometricVerified: true,
      biometricType,
      deviceInfo
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Biometric Check-out for students
router.post('/student/biometric/checkout', async (req, res) => {
  try {
    const { studentId, biometricId, deviceInfo } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      studentId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({ message: 'Student has already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.status = 'checked-out';
    attendance.biometricVerified = true;
    attendance.deviceInfo = deviceInfo;

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --------------------------------------------------------------------- */
// Get attendance record for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    let query = { userId };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 1);

      query.date = { $gte: targetDate, $lt: endDate };
    }

    const attendances = await Attendance.find(query).sort({ date: -1 });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance record for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date } = req.query;

    let query = { studentId };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 1);

      query.date = { $gte: targetDate, $lt: endDate };
    }

    const attendances = await Attendance.find(query).sort({ date: -1 });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily attendance records for a specific date
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 1);

    const attendances = await Attendance.find({
      date: { $gte: targetDate, $lt: endDate }
    })
      .populate('userId', 'name email role')
      .populate('studentId', 'name uniqueId grade section')
      .sort({ checkInTime: 1 });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all attendance records for a specific date (for chairman view)
router.get('/all/:date', async (req, res) => {
  try {
    const { date } = req.params;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(40).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 1);

    const attendances = await Attendance.find({
      date: { $gte: targetDate, $lt: endDate }
    })
      .populate('userId', 'name email role')
      .populate('studentId', 'name uniqueId grade section')
      .sort({ checkInTime: 1 });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({ message: error.message });
  }
});
// Bulk student attendance
router.post('/student/bulk', async (req, res) => {
  try {
    const { grade, date, statuses } = req.body;

    const attendancePromises = Object.keys(statuses).map(async (studentId) => {
      const status = statuses[studentId];
      const today = new Date(date);
      today.setHours(0, 0, 0, 0);

      const existingAttendance = await Attendance.findOne({
        studentId,
        date: today,
      });

      // Map student attendance statuses to attendance statuses
      let attendanceStatus = status;
      let checkInTime = null;
      
      if (status === 'present') {
        attendanceStatus = 'checked-in';
        checkInTime = new Date();
      } else if (status === 'absent' || status === 'leave') {
        attendanceStatus = 'checked-out';
      }

      if (existingAttendance) {
        existingAttendance.status = attendanceStatus;
        existingAttendance.checkInTime = checkInTime;
        return existingAttendance.save();
      } else {
        const newAttendance = new Attendance({
          studentId,
          date: today,
          status: attendanceStatus,
          checkInTime: checkInTime,
          grade: grade,
        });
        return newAttendance.save();
      }
    });

    await Promise.all(attendancePromises);
    res.status(201).json({ message: 'Bulk attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get range attendance records with both users and students
router.get('/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'Start and end dates required' });

    // Validate format YYYY‑MM‑DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // inclusive

    const attendances = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('userId', 'name email role')
      .populate('studentId', 'name uniqueId grade section')
      .sort({ date: 1 });

    res.json(attendances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
