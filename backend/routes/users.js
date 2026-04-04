const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Policy = require('../models/Policy');
const store = require('../middleware/store');
const { calculatePremium } = require('../middleware/insurance');

const useDB = () => mongoose.connection.readyState === 1;

// POST /api/users — Register a new gig worker
router.post('/', async (req, res) => {
  try {
    const { name, city, jobType, weeklyIncome } = req.body;
    if (!name || !city || !jobType || !weeklyIncome) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { breakdown, weeklyPremium, riskScore, coverageAmount, persona, trustScore } = calculatePremium({ jobType, weeklyIncome, city });

    if (useDB()) {
      const user = new User({ 
        name, 
        city, 
        jobType, 
        weeklyIncome, 
        riskScore, 
        weeklyPremium, 
        premiumBreakdown: breakdown,
        persona,
        trustScore
      });
      await user.save();

      const policy = new Policy({ userId: user._id, coverageAmount, weeklyPremium, active: true });
      await policy.save();

      return res.status(201).json({ user, policy, message: 'Registration successful!' });
    } else {
      // Memory mode
      const id = store.nextId();
      const user = { 
        _id: id, 
        name, 
        city, 
        jobType, 
        weeklyIncome, 
        riskScore, 
        weeklyPremium, 
        premiumBreakdown: breakdown, 
        persona,
        trustScore,
        createdAt: new Date() 
      };
      store.users.push(user);

      const policyId = store.nextId();
      const policy = { _id: policyId, userId: id, coverageAmount, weeklyPremium, active: true, createdAt: new Date() };
      store.policies.push(policy);

      return res.status(201).json({ user, policy, message: 'Registration successful! (memory mode)' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — Get user with policy and claims
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useDB()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const policy = await Policy.findOne({ userId: id });
      const claims = await require('../models/Claim').find({ userId: id }).sort({ createdAt: -1 });
      return res.json({ user, policy, claims });
    } else {
      const user = store.users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const policy = store.policies.find(p => p.userId === id);
      const claims = store.claims.filter(c => c.userId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ user, policy, claims });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users — List all users
router.get('/', async (req, res) => {
  try {
    if (useDB()) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json(users);
    } else {
      return res.json(store.users);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
