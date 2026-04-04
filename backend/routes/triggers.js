const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const store = require('../middleware/store');
const { simulateEnvironment, evaluateTriggers, getPredictiveAlerts } = require('../middleware/insurance');

const useDB = () => mongoose.connection.readyState === 1;

// ─── Trigger Log Schema (in-memory + Mongo) ─────────────────────────────────
let TriggerLog;
try {
  const schema = new mongoose.Schema({
    city:        { type: String },
    scenario:    { type: String, default: 'normal' },
    environment: { type: Object },
    triggers:    { type: Array, default: [] },
    triggered:   { type: Boolean, default: false },
    checkedAt:   { type: Date, default: Date.now }
  });
  TriggerLog = mongoose.models.TriggerLog || mongoose.model('TriggerLog', schema);
} catch (e) {}

// In-memory trigger log fallback
if (!store.triggerLogs) store.triggerLogs = [];

// ─── POST /api/triggers/check ────────────────────────────────────────────────
// Check trigger conditions for a city+scenario, log the result
router.post('/check', async (req, res) => {
  try {
    const { city = 'unknown', scenario = 'normal' } = req.body;
    const environment = simulateEnvironment(city, scenario);
    const triggers    = evaluateTriggers(environment);
    const triggered   = triggers.length > 0;

    const logEntry = { city, scenario, environment, triggers, triggered, checkedAt: new Date() };

    if (useDB() && TriggerLog) {
      const doc = new TriggerLog(logEntry);
      await doc.save();
      logEntry._id = doc._id;
    } else {
      logEntry._id = store.nextId();
      store.triggerLogs.push(logEntry);
    }

    res.json({
      triggered,
      environment,
      triggers,
      triggerCount: triggers.length,
      message: triggered
        ? `⚡ ${triggers.length} parametric trigger(s) detected in ${city}`
        : `✓ No trigger conditions met in ${city}`,
      checkedAt: logEntry.checkedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/triggers/status ─────────────────────────────────────────────────
// Live current status for all 3 scenarios — used by dashboard status panel
router.get('/status', async (req, res) => {
  try {
    const { city = 'Mumbai' } = req.query;
    const current   = simulateEnvironment(city, 'normal'); // live "normal" reading
    const triggers  = evaluateTriggers(current);
    const alerts    = getPredictiveAlerts(current);

    res.json({
      city,
      environment: current,
      activeTriggers: triggers,
      isTriggered: triggers.length > 0,
      alerts,
      thresholds: {
        rainfall:    { label: 'Rainfall',     unit: 'mm',  threshold: 50,  current: current.rainfall_mm },
        temperature: { label: 'Temperature',  unit: '°C',  threshold: 40,  current: current.temperature_c },
        aqi:         { label: 'Air Quality',  unit: 'AQI', threshold: 300, current: current.aqi }
      },
      checkedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/triggers/logs ───────────────────────────────────────────────────
// History of all trigger checks (last 50)
router.get('/logs', async (req, res) => {
  try {
    if (useDB() && TriggerLog) {
      const logs = await TriggerLog.find().sort({ checkedAt: -1 }).limit(50);
      return res.json(logs);
    }
    const logs = [...store.triggerLogs]
      .sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt))
      .slice(0, 50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
