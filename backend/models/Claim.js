const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  triggerType: { type: String, required: true },
  triggerLabel: { type: String },
  triggerValue: { type: String },
  payoutAmount: { type: Number, required: true },
  status: { type: String, default: 'approved' },
  fraudCheck: { type: Object, default: { passed: true, reason: 'Fraud Check Passed' } },
  environment: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);
