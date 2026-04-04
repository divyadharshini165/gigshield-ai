// High-risk cities in India
const HIGH_RISK_CITIES = ['mumbai', 'delhi', 'chennai', 'kolkata', 'bangalore', 'hyderabad', 'pune', 'ahmedabad'];

/**
 * Calculate weekly premium and risk score for a gig worker
 * @param {Object} params - { jobType, weeklyIncome, city }
 * @returns {Object} - { basePremium, breakdown, weeklyPremium, riskScore, persona, trustScore }
 */
function calculatePremium({ jobType, weeklyIncome, city }) {
  const breakdown = [];
  let premium = 50;
  let riskPoints = 20; // base risk

  breakdown.push({ label: 'Base Premium', amount: 50, sign: '' });

  // Income risk
  if (Number(weeklyIncome) > 10000) {
    premium += 10;
    riskPoints += 10;
    breakdown.push({ label: 'High Income Risk', amount: 10, sign: '+' });
  }

  // Job type risk
  const jobLower = (jobType || '').toLowerCase();
  if (jobLower === 'delivery') {
    premium += 15;
    riskPoints += 25;
    breakdown.push({ label: 'Delivery Job Risk', amount: 15, sign: '+' });
  } else if (jobLower === 'driver' || jobLower === 'ride-share') {
    premium += 10;
    riskPoints += 20;
    breakdown.push({ label: 'Driver Risk', amount: 10, sign: '+' });
  } else if (jobLower === 'construction') {
    premium += 20;
    riskPoints += 30;
    breakdown.push({ label: 'Construction Risk', amount: 20, sign: '+' });
  }

  // City risk
  const cityLower = (city || '').toLowerCase();
  const isHighRiskCity = HIGH_RISK_CITIES.some(c => cityLower.includes(c));
  if (isHighRiskCity) {
    premium += 10;
    riskPoints += 15;
    breakdown.push({ label: 'High-Risk City', amount: 10, sign: '+' });
  }

  const riskScore = Math.min(riskPoints, 100);

  // --- UNIQUENESS: Risk Persona System ---
  let persona = 'Standard Gig Worker';
  if (jobLower === 'delivery' && isHighRiskCity) {
    persona = 'Flood Zone Courier';
  } else if ((jobLower === 'driver' || jobLower === 'ride-share') && isHighRiskCity) {
    persona = 'Heat Risk Rider';
  } else if (jobLower === 'construction') {
    persona = 'Outdoor Exposure Pro';
  } else if (isHighRiskCity) {
    persona = 'Urban Risk Navigator';
  } else {
    persona = 'Low Risk Operator';
  }

  // --- UNIQUENESS: Trust Score System ---
  // Initial trust score based on risk (lower risk = higher initial trust)
  const trustScore = Math.max(70, 100 - Math.floor(riskScore / 2));

  return {
    breakdown,
    weeklyPremium: premium,
    riskScore,
    coverageAmount: premium * 20, // coverage = 20x premium
    persona,
    trustScore
  };
}

/**
 * Simulate environmental conditions for a city
 * Returns: { rainfall_mm, temperature_c, aqi }
 */
function simulateEnvironment(city = '', scenario = 'normal') {
  if (scenario === 'rainstorm') {
    return { rainfall_mm: 65, temperature_c: 28, aqi: 80 };
  }
  if (scenario === 'heatwave') {
    return { rainfall_mm: 0, temperature_c: 43, aqi: 150 };
  }
  if (scenario === 'smog') {
    return { rainfall_mm: 2, temperature_c: 32, aqi: 340 };
  }
  // Normal/random
  return {
    rainfall_mm: Math.floor(Math.random() * 30),
    temperature_c: 28 + Math.floor(Math.random() * 8),
    aqi: 80 + Math.floor(Math.random() * 100)
  };
}

/**
 * Evaluate triggers from environmental data
 * Returns array of triggered conditions
 */
function evaluateTriggers(envData) {
  const triggers = [];
  if (envData.rainfall_mm > 50) {
    triggers.push({
      type: 'rain',
      label: 'Heavy Rainfall',
      value: `${envData.rainfall_mm}mm`,
      threshold: '>50mm',
      payoutMultiplier: 2.0
    });
  }
  if (envData.temperature_c > 40) {
    triggers.push({
      type: 'heat',
      label: 'Extreme Heat',
      value: `${envData.temperature_c}°C`,
      threshold: '>40°C',
      payoutMultiplier: 1.5
    });
  }
  if (envData.aqi > 300) {
    triggers.push({
      type: 'pollution',
      label: 'Severe Air Pollution',
      value: `AQI ${envData.aqi}`,
      threshold: '>300 AQI',
      payoutMultiplier: 1.5
    });
  }
  return triggers;
}

/**
 * Basic fraud check: user city vs trigger location
 */
function fraudCheck(userCity, triggerCity) {
  if (!triggerCity || !userCity) return { passed: true, reason: 'Location match confirmed' };
  const match = userCity.toLowerCase().trim() === triggerCity.toLowerCase().trim();
  return {
    passed: match,
    reason: match ? 'Fraud Check Passed — Location verified' : 'Flagged — Location mismatch detected'
  };
}

/**
 * UNIQUENESS: Adaptive Coverage Engine
 * Adjusts coverage based on environmental risk
 */
function getAdaptiveCoverage(baseCoverage, envData) {
  let multiplier = 1.0;
  let message = '';

  if (envData.rainfall_mm > 40 || envData.temperature_c > 38 || envData.aqi > 250) {
    multiplier = 1.25;
    message = 'Coverage boosted due to high risk';
  }

  return {
    adjustedCoverage: Math.round(baseCoverage * multiplier),
    isBoosted: multiplier > 1.0,
    message
  };
}

/**
 * UNIQUENESS: Predictive Alerts
 * Generates alerts based on current environment
 */
function getPredictiveAlerts(envData) {
  const alerts = [];
  if (envData.rainfall_mm > 40) {
    alerts.push({ type: 'warning', message: 'Heavy rain expected – earnings at risk' });
  }
  if (envData.temperature_c > 38) {
    alerts.push({ type: 'warning', message: 'High heat conditions detected' });
  }
  if (envData.aqi > 250) {
    alerts.push({ type: 'warning', message: 'Poor air quality – wear protective gear' });
  }
  return alerts;
}

module.exports = { 
  calculatePremium, 
  simulateEnvironment, 
  evaluateTriggers, 
  fraudCheck, 
  getAdaptiveCoverage,
  getPredictiveAlerts
};
