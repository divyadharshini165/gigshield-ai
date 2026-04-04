const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gig_insurance';

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection (non-blocking)
let dbConnected = false;
mongoose.connect(MONGO_URI)
  .then(() => {
    dbConnected = true;
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.warn('⚠️  MongoDB not available — running in memory mode:', err.message);
  });

// Routes
app.use('/api/users',    require('./routes/users'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims',   require('./routes/claims'));
app.use('/api/triggers', require('./routes/triggers'));

// --- CHATBOT ROUTE ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userData } = req.body;
    const msg = message.toLowerCase();
    let response = "I'm your ParametriX assistant. How can I help you today?";

    if (msg.includes('premium')) {
      response = `Your weekly premium is ₹${userData.user.weeklyPremium}. It's calculated based on your job as a ${userData.user.jobType} and the risk factors in ${userData.user.city}.`;
    } else if (msg.includes('payout') || msg.includes('claim')) {
      if (userData.claims && userData.claims.length > 0) {
        const lastClaim = userData.claims[0];
        response = `Your last payout was ₹${lastClaim.payoutAmount} on ${new Date(lastClaim.createdAt).toLocaleDateString()}. It was triggered by ${lastClaim.triggerLabel || lastClaim.triggerType}.`;
      } else {
        response = "You haven't had any automatic payouts yet. Payouts are triggered instantly when weather conditions exceed safety thresholds.";
      }
    } else if (msg.includes('risk score')) {
      response = `Your current risk score is ${userData.user.riskScore}/100. This is based on your job type, income, and city risk factors.`;
    } else if (msg.includes('persona')) {
      response = `Your risk persona is "${userData.user.persona}". This helps us tailor your coverage to the specific challenges you face in ${userData.user.city}.`;
    } else if (msg.includes('trust')) {
      response = `Your trust score is ${userData.user.trustScore}/100. High trust scores ensure faster automated processing and fewer manual reviews.`;
    } else if (msg.includes('hello') || msg.includes('hi')) {
      response = `Hello ${userData.user.name}! I'm here to help you with your ParametriX policy and coverage.`;
    }

    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: dbConnected ? 'connected' : 'disconnected (memory mode)',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
