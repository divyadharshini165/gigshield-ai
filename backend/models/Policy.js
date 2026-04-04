const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  coverageAmount: { type: Number, required: true },
  weeklyPremium: { type: Number, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);
