const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  jobType: { type: String, required: true },
  weeklyIncome: { type: Number, required: true },
  riskScore: { type: Number, default: 0 },
  weeklyPremium: { type: Number, default: 50 },
  premiumBreakdown: { type: Array, default: [] },
  persona: { type: String, default: 'Standard Gig Worker' },
  trustScore: { type: Number, default: 80 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
