const express = require('express');
const Timetable = require('../models/Timetable');
const { authMiddleware   } = require('../middleware/jwt');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const timetables = await Timetable.find({}, { class: 1, _id: 0 });
    res.json(timetables.map(t => t.class));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:class', authMiddleware, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ class: req.params.class });
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found for this class' });
    }
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:class', authMiddleware, async (req, res) => {
  try {
    const { schedule } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { class: req.params.class },
      { schedule },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(timetable);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:class/:day', authMiddleware, async (req, res) => {
  try {
    const { day } = req.params;
    const { schedule, time, teacher } = req.body;

    if (schedule) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (!validDays.includes(day)) {
        return res.status(400).json({ error: 'Invalid day.' });
      }
      const timetable = await Timetable.findOneAndUpdate(
        { class: req.params.class },
        { [`schedule.${day}`]: schedule },
        { new: true, runValidators: true }
      );
      return res.json(timetable);
    }

    if (time && teacher) {
      const timetable = await Timetable.findOne({ class: req.params.class });
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this class' });
      }

      const daySchedule = timetable.schedule[day];
      if (!daySchedule) {
        return res.status(400).json({ error: 'Invalid day for this timetable.' });
      }

      const slot = daySchedule.find(s => s.time === time);
      if (!slot) {
        return res.status(404).json({ error: 'Time slot not found.' });
      }

      const User = require('../models/User');
      const user = await User.findById(teacher);
      if (user) {
        slot.teacher = user.name;
      } else {
        slot.teacher = teacher;
      }

      await timetable.save();
      return res.json(timetable);
    }

    res.status(40).json({ error: 'Invalid request. Provide either a full schedule or a time and teacher.' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:class', authMiddleware, async (req, res) => {
  try {
    const deleted = await Timetable.findOneAndDelete({ class: req.params.class });
    if (!deleted) {
      return res.status(404).json({ error: 'Timetable not found for this class' });
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
