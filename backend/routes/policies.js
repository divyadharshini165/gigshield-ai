const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Policy = require('../models/Policy');
const store = require('../middleware/store');

const useDB = () => mongoose.connection.readyState === 1;

// GET /api/policies/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (useDB()) {
      const policy = await Policy.findOne({ userId });
      if (!policy) return res.status(404).json({ error: 'Policy not found' });
      return res.json(policy);
    } else {
      const policy = store.policies.find(p => p.userId === userId);
      if (!policy) return res.status(404).json({ error: 'Policy not found' });
      return res.json(policy);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/policies/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    if (useDB()) {
      const policy = await Policy.findById(id);
      if (!policy) return res.status(404).json({ error: 'Policy not found' });
      policy.active = !policy.active;
      await policy.save();
      return res.json(policy);
    } else {
      const policy = store.policies.find(p => p._id === id);
      if (!policy) return res.status(404).json({ error: 'Policy not found' });
      policy.active = !policy.active;
      return res.json(policy);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
