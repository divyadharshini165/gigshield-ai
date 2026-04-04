import React, { useState } from 'react';
import { registerUser } from '../utils/api';
import { Alert, Spinner } from '../components/UI';

const JOB_TYPES = ['Delivery', 'Driver', 'Ride-Share', 'Construction', 'Freelancer', 'Courier', 'Other'];
const CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Nagpur'];

function PremiumPreview({ jobType, weeklyIncome, city }) {
  const breakdown = [];
  let total = 50;
  let riskScore = 20;
  let persona = 'Standard Gig Worker';
  let trustScore = 80;

  breakdown.push({ label: 'Base Premium', amount: 50, sign: '' });
  if (Number(weeklyIncome) > 10000) { 
    total += 10; 
    riskScore += 10;
    breakdown.push({ label: 'High Income Risk', amount: 10, sign: '+' }); 
  }
  
  const jl = jobType.toLowerCase();
  const highRisk = ['mumbai','delhi','chennai','kolkata','bangalore','hyderabad','pune','ahmedabad'];
  const isHighRiskCity = highRisk.some(c => city.toLowerCase().includes(c));
  
  if (jl === 'delivery') { 
    total += 15; 
    riskScore += 25;
    breakdown.push({ label: 'Delivery Job Risk', amount: 15, sign: '+' }); 
    if (isHighRiskCity) persona = 'Flood Zone Courier';
  }
  else if (jl === 'driver' || jl === 'ride-share') { 
    total += 10; 
    riskScore += 20;
    breakdown.push({ label: 'Driver Risk', amount: 10, sign: '+' }); 
    if (isHighRiskCity) persona = 'Heat Risk Rider';
  }
  else if (jl === 'construction') { 
    total += 20; 
    riskScore += 30;
    breakdown.push({ label: 'Construction Risk', amount: 20, sign: '+' }); 
    persona = 'Outdoor Exposure Pro';
  }
  
  if (isHighRiskCity) { 
    total += 10; 
    riskScore += 15;
    breakdown.push({ label: 'High-Risk City', amount: 10, sign: '+' }); 
    if (!persona.includes('Zone') && !persona.includes('Risk') && !persona.includes('Pro')) {
      persona = 'Urban Risk Navigator';
    }
  }

  riskScore = Math.min(riskScore, 100);
  trustScore = Math.max(70, 100 - Math.floor(riskScore / 2));

  if (!jobType && !weeklyIncome && !city) return null;

  return (
    <div className="mt-4 rounded-xl bg-[#1c2f3e] border border-[#243447] p-4 slide-up">
      <p className="text-xs text-[#7a9ab5] uppercase tracking-widest mb-3">Coverage Details</p>
      <div className="space-y-2">
        {breakdown.map((b, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-[#7a9ab5]">{b.label}</span>
            <span className={`font-mono font-medium ${b.sign === '+' ? 'text-[#ff7849]' : 'text-white'}`}>
              {b.sign}₹{b.amount}
            </span>
          </div>
        ))}
        <div className="border-t border-[#243447] mt-2 pt-2 flex justify-between">
          <span className="text-sm font-semibold text-white">Weekly Premium</span>
          <span className="font-mono font-bold text-[#00d4ff]">₹{total}/week</span>
        </div>
        
        {/* Persona and Trust Score */}
        <div className="border-t border-[#243447] mt-3 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#7a9ab5]">Your Persona</span>
            <span className="text-xs font-semibold text-[#00e5a0]">{persona}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#7a9ab5]">Trust Score</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-[#243447] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00e5a0]" 
                  style={{ width: `${trustScore}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white">{trustScore}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#7a9ab5]">Risk Score</span>
            <span className="text-xs font-semibold text-[#ff7849]">{riskScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage({ onRegistered }) {
  const [form, setForm] = useState({ name: '', city: '', jobType: '', weeklyIncome: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name || !form.city || !form.jobType || !form.weeklyIncome) {
      return setError('All fields are required.');
    }
    setLoading(true);
    try {
      const result = await registerUser({ ...form, weeklyIncome: Number(form.weeklyIncome) });
      setSuccess(`Welcome, ${result.user.name}! Your ${result.user.persona} policy is active.`);
      setTimeout(() => onRegistered(result.user._id), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--surface)' }}>
      {/* Background decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #00e5a0, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #00d4ff22, #00e5a022)', border: '1px solid rgba(0,212,255,0.3)' }}>
              ⚡
            </div>
            <span className="font-display font-bold text-2xl text-white">ParametriX</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Adaptive Income Protection</h1>
          <p className="text-[#7a9ab5] text-sm">Parametric insurance that adapts to your risk and pays automatically.</p>
        </div>

        {/* Card */}
        <div className="gradient-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7a9ab5] uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Ravi Kumar"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#7a9ab5] uppercase tracking-wider mb-1.5">City</label>
                <select value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a9ab5] uppercase tracking-wider mb-1.5">Job Type</label>
                <select value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                  <option value="">Select job</option>
                  {JOB_TYPES.map(j => <option key={j} value={j.toLowerCase()}>{j}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7a9ab5] uppercase tracking-wider mb-1.5">Weekly Income (₹)</label>
              <input
                type="number"
                placeholder="e.g. 8000"
                value={form.weeklyIncome}
                onChange={e => set('weeklyIncome', e.target.value)}
                min="0"
              />
            </div>

            {/* Live premium preview */}
            <PremiumPreview jobType={form.jobType} weeklyIncome={form.weeklyIncome} city={form.city} />

            {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50"
              style={{
                background: loading ? '#1c2f3e' : 'linear-gradient(135deg, #00d4ff, #0284c7)',
                color: loading ? '#7a9ab5' : '#0c1e2c',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(0,212,255,0.3)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#7a9ab5] border-t-transparent rounded-full animate-spin" />
                  Registering...
                </span>
              ) : 'Activate My Policy →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#7a9ab5] mt-4">
          Automatic payouts · Adaptive coverage · Real-time triggers
        </p>
      </div>
    </div>
  );
}
