const BASE = 'http://localhost:5000/api';

async function req(url, opts = {}) {
  const res  = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

// ── Users ────────────────────────────────────────────────────────────────────
export const registerUser = (data) => req(`${BASE}/users`, { method: 'POST', body: JSON.stringify(data) });
export const getUser      = (id)   => req(`${BASE}/users/${id}`);
export const listUsers    = ()     => req(`${BASE}/users`);

// ── Policies ─────────────────────────────────────────────────────────────────
export const getPolicy    = (userId)   => req(`${BASE}/policies/${userId}`);
export const togglePolicy = (policyId) => req(`${BASE}/policies/${policyId}/toggle`, { method: 'PATCH' });

// ── Claims ───────────────────────────────────────────────────────────────────
export const getClaims   = (userId) => req(`${BASE}/claims/${userId}`);
export const getAllClaims = ()       => req(`${BASE}/claims`);
export const simulateClaim = (userId, scenario, triggerCity) =>
  req(`${BASE}/claims/simulate`, { method: 'POST', body: JSON.stringify({ userId, scenario, triggerCity }) });
export const simulateFraud = (userId) =>
  req(`${BASE}/claims/simulate-fraud`, { method: 'POST', body: JSON.stringify({ userId }) });

// ── Triggers ─────────────────────────────────────────────────────────────────
export const checkTrigger     = (city, scenario) =>
  req(`${BASE}/triggers/check`, { method: 'POST', body: JSON.stringify({ city, scenario }) });
export const getTriggerStatus = (city) =>
  req(`${BASE}/triggers/status?city=${encodeURIComponent(city)}`);
export const getTriggerLogs   = () => req(`${BASE}/triggers/logs`);

// ── Chatbot ─────────────────────────────────────────────────────────────────
export const sendChatMessage = (message, userData) =>
  req(`${BASE}/chat`, { method: 'POST', body: JSON.stringify({ message, userData }) });

// ── Health ───────────────────────────────────────────────────────────────────
export const getHealth = () => req(`${BASE}/health`);
