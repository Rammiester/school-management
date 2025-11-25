const express = require('express');
const router = express.Router();
const BillingTemplate = require('../models/BillingTemplate');
const { adminMiddleware } = require('../middleware/jwt');

// Get all billing templates
router.get('/', async (req, res) => {
  try {
    const templates = await BillingTemplate.find().populate('createdBy', 'name');
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one billing template
router.get('/:id', getTemplate, (req, res) => {
  res.json(res.template);
});

// Create a billing template
router.post('/', adminMiddleware, async (req, res) => {
  const { name, description, props, feeTypeDescriptions } = req.body;
  const template = new BillingTemplate({
    name,
    description,
    props,
    feeTypeDescriptions,
    createdBy: req.user.id,
  });

  try {
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a billing template
router.patch('/:id', adminMiddleware, getTemplate, async (req, res) => {
  if (req.body.name != null) {
    res.template.name = req.body.name;
  }
  if (req.body.description != null) {
    res.template.description = req.body.description;
  }
  if (req.body.props != null) {
    res.template.props = req.body.props;
  }
  if (req.body.feeTypeDescriptions != null) {
    res.template.feeTypeDescriptions = req.body.feeTypeDescriptions;
  }
  try {
    const updatedTemplate = await res.template.save();
    res.json(updatedTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a billing template
router.delete('/:id', adminMiddleware, getTemplate, async (req, res) => {
  try {
    await res.template.deleteOne();
    res.json({ message: 'Deleted Billing Template' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getTemplate(req, res, next) {
  let template;
  try {
    template = await BillingTemplate.findById(req.params.id);
    if (template == null) {
      return res.status(404).json({ message: 'Cannot find template' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.template = template;
  next();
}

module.exports = router;
