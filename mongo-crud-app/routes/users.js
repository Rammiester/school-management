const express = require('express');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const { generateToken, authMiddleware, chairmanMiddleware } = require('../middleware/jwt');
const router   = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hash, 
      role,
      status: req.body.role === 'chairman' ? 'approved' : 'pending'
    });
    await user.save();
    
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/approve/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'chairman') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        role: role || 'user'
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      message: 'User approved successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending-debug', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    if (pendingUsers.length === 0) {
      return res.status(404).json({ error: 'No pending users found' });
    }
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', authMiddleware, chairmanMiddleware, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/atendencelist', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['teacher', 'staff'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/availability/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const availability = await User.getAvailabilityStatus(userId);
    if (availability.error) {
      return res.status(404).json({ error: availability.error });
    }
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/availability/check', authMiddleware, async (req, res) => {
  try {
    const { userId, date, timeSlot } = req.body;
    const isBusy = await User.isBusyAtTime(userId, new Date(date), timeSlot);
    res.json({
      userId: userId,
      date: date,
      timeSlot: timeSlot,
      isBusy: isBusy,
      status: isBusy ? 'busy' : 'free'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/available', authMiddleware, async (req, res) => {
  try {
    const { role, day, timeSlot } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query);
    
    if (day && timeSlot) {
      const availableUsers = [];
      for (const user of users) {
        const isBusy = await User.isBusyAtTime(user._id, new Date(), timeSlot);
        if (!isBusy) {
          availableUsers.push(user);
        }
      }
      res.json(availableUsers);
    } else {
      const usersWithAvailability = await Promise.all(users.map(async (user) => {
        const availability = await User.getAvailabilityStatus(user._id);
        return {
          ...user.toObject(),
          availability: availability
        };
      }));
      res.json(usersWithAvailability);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.json([]);
    }

    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).maxTimeMS(30000);
    
    if (!user) throw new Error('Invalid email or password');
    
    if (user.status !== 'approved') {
      throw new Error('Account not approved yet');
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid email or password');

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
