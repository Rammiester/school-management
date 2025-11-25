const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { adminMiddleware } = require('../middleware/jwt');

// Get all active departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name description createdAt')
      .sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get all departments (including inactive)
router.get('/all', adminMiddleware, async (req, res) => {
  try {
    const departments = await Department.find()
      .sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching all departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create a new department
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingDept) {
      return res.status(400).json({ error: 'Department with this name already exists' });
    }

    const department = new Department({
      name,
      description
    });

    const savedDept = await department.save();
    res.status(201).json({ success: true, data: savedDept });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const { id } = req.params;

    // Check if department name already exists (excluding current department)
    if (name) {
      const existingDept = await Department.findOne({ 
        name: new RegExp(`^${name}$`, 'i'), 
        _id: { $ne: id } 
      });
      if (existingDept) {
        return res.status(400).json({ error: 'Department with this name already exists' });
      }
    }

    const updatedDept = await Department.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ success: true, data: updatedDept });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(50).json({ error: 'Failed to update department' });
  }
});

// Delete department
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDept = await Department.findByIdAndDelete(id);
    if (!deletedDept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

module.exports = router;
