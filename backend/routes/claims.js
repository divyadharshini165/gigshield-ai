const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const store = require('../middleware/store');
const { simulateEnvironment, evaluateTriggers, fraudCheck, getAdaptiveCoverage } = require('../middleware/insurance');

const useDB = () => mongoose.connection.readyState === 1;

async function getUserById(id) {
  if (useDB()) {
    return await require('../models/User').findById(id);
  }
  return store.users.find(u => u._id === id);
}

async function getPolicyByUserId(userId) {
  if (useDB()) {
    return await Policy.findOne({ userId });
  }
  return store.policies.find(p => p.userId === userId);
}

// POST /api/claims/simulate-fraud — simulate a fraud scenario (location mismatch)
router.post('/simulate-fraud', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const policy = await getPolicyByUserId(userId);
    if (!policy || !policy.active) {
      return res.status(400).json({ error: 'No active policy found' });
    }

    const envData  = simulateEnvironment(user.city, 'rainstorm');
    const triggers = evaluateTriggers(envData);
    // Force a location mismatch — claim location differs from registered city
    const fraud    = fraudCheck(user.city, 'Ahmedabad');

    const createdClaims = [];
    for (const trigger of triggers) {
      const payoutAmount = Math.round(policy.coverageAmount * trigger.payoutMultiplier * 0.5);
      const claimData = {
        userId,
        triggerType:  trigger.type,
        triggerLabel: trigger.label,
        triggerValue: trigger.value,
        payoutAmount,
        status:      'flagged',
        fraudCheck:  fraud,
        environment: envData
      };

      if (useDB()) {
        const claim = new Claim(claimData);
        await claim.save();
        createdClaims.push(claim);
      } else {
        const claim = { _id: store.nextId(), ...claimData, createdAt: new Date() };
        store.claims.push(claim);
        createdClaims.push(claim);
      }
    }

    return res.json({
      triggered: true,
      scenario: 'fraud_simulation',
      environment: envData,
      triggers,
      claims: createdClaims,
      fraudCheck: fraud,
      message: '⚠ Fraud simulation complete — location mismatch flagged'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/claims/simulate — simulate weather event and auto-trigger claims
router.post('/simulate', async (req, res) => {
  try {
    const { userId, scenario = 'rainstorm', triggerCity = '' } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const policy = await getPolicyByUserId(userId);
    if (!policy || !policy.active) {
      return res.status(400).json({ error: 'No active policy found for this user' });
    }

    // Simulate environment
    const envData = simulateEnvironment(user.city, scenario);

    // Evaluate triggers
    const triggers = evaluateTriggers(envData);
    if (triggers.length === 0) {
      return res.json({ triggered: false, message: 'No trigger conditions met', environment: envData });
    }

    // Fraud check
    const fraud = fraudCheck(user.city, triggerCity || user.city);

    // Adaptive Coverage Engine
    const { adjustedCoverage, isBoosted, message: boostMessage } = getAdaptiveCoverage(policy.coverageAmount, envData);

    // Auto-create & auto-approve claims for each trigger
    const createdClaims = [];
    for (const trigger of triggers) {
      // Payout is based on adjusted coverage if boosted
      const payoutAmount = Math.round(adjustedCoverage * trigger.payoutMultiplier * 0.5);

      const claimData = {
        userId,
        triggerType: trigger.type,
        triggerLabel: trigger.label,
        triggerValue: trigger.value,
        payoutAmount,
        status: fraud.passed ? 'approved' : 'flagged',
        fraudCheck: fraud,
        environment: envData,
        isBoosted,
        boostMessage
      };

      if (useDB()) {
        const claim = new Claim(claimData);
        await claim.save();
        createdClaims.push(claim);
      } else {
        const claim = {
          _id: store.nextId(),
          ...claimData,
          createdAt: new Date()
        };
        store.claims.push(claim);
        createdClaims.push(claim);
      }
    }

    return res.json({
      triggered: true,
      scenario,
      environment: envData,
      triggers,
      claims: createdClaims,
      fraudCheck: fraud,
      isBoosted,
      boostMessage,
      message: fraud.passed ? `${createdClaims.length} claim(s) auto-approved` : `⚠ ${createdClaims.length} claim(s) flagged for review`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/claims — all claims (for demo/admin overview)
router.get('/', async (req, res) => {
  try {
    if (useDB()) {
      const claims = await Claim.find().sort({ createdAt: -1 }).limit(100);
      return res.json(claims);
    }
    const claims = [...store.claims].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/claims/:userId — get all claims for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (useDB()) {
      const claims = await Claim.find({ userId }).sort({ createdAt: -1 });
      return res.json(claims);
    } else {
      const claims = store.claims.filter(c => c.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(claims);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
