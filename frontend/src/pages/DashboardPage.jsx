import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUser, simulateClaim, simulateFraud,
  togglePolicy, getTriggerStatus, getTriggerLogs, getHealth
} from '../utils/api';
import { Badge, StatCard, Spinner, Alert, SectionHeader, EnvMeter } from '../components/UI';
import Chatbot from '../components/Chatbot';

const TRIGGER_ICONS  = { rain: '🌧', heat: '🌡', pollution: '💨' };
const TRIGGER_COLORS = { rain: 'blue', heat: 'orange', pollution: 'muted' };

const SCENARIOS = [
  { key: 'rainstorm', label: 'Simulate Rainstorm',  icon: '🌧', desc: 'Triggers: Rainfall > 50mm',     color: '#00d4ff', rgb: '0,212,255' },
  { key: 'heatwave',  label: 'Simulate Heatwave',   icon: '🌡', desc: 'Triggers: Temperature > 40°C',  color: '#ff7849', rgb: '255,120,73' },
  { key: 'smog',      label: 'Simulate Smog Alert',  icon: '💨', desc: 'Triggers: AQI > 300',          color: '#7a9ab5', rgb: '122,154,181' },
  { key: 'normal',    label: 'Normal Conditions',    icon: '☀',  desc: 'No triggers (safe day)',        color: '#00e5a0', rgb: '0,229,160' },
];

function ClaimCard({ claim }) {
  const icon        = TRIGGER_ICONS[claim.triggerType] || '📋';
  const fraudPassed = claim.fraudCheck?.passed !== false;
  const isFlagged   = claim.status === 'flagged';
  const isBoosted   = claim.isBoosted;
  
  return (
    <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-4 slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: fraudPassed ? 'rgba(0,229,160,0.1)' : 'rgba(255,77,109,0.1)',
              border: `1px solid ${fraudPassed ? 'rgba(0,229,160,0.2)' : 'rgba(255,77,109,0.2)'}`
            }}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white">{claim.triggerLabel || claim.triggerType}</p>
            <p className="text-xs text-[#7a9ab5] mt-0.5 font-mono">{claim.triggerValue}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-mono font-bold text-lg ${isFlagged ? 'text-[#ff4d6d]' : 'text-[#00e5a0]'}`}>
            ₹{claim.payoutAmount?.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#7a9ab5] mt-0.5">{isFlagged ? 'held' : 'credited'}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#243447]">
        <Badge color={isFlagged ? 'red' : 'green'}>{isFlagged ? '⚠ Flagged' : '✓ Auto-Approved'}</Badge>
        <Badge color={fraudPassed ? 'green' : 'red'}>
          {fraudPassed ? '🛡 Fraud Check Passed' : '⚠ Suspicious Activity'}
        </Badge>
        {isBoosted && <Badge color="blue">⚡ Coverage Boosted</Badge>}
        {claim.environment && (
          <Badge color="muted">
            {claim.environment.rainfall_mm}mm · {claim.environment.temperature_c}°C · AQI {claim.environment.aqi}
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-[#7a9ab5] font-mono">
          {new Date(claim.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </div>
    </div>
  );
}

function PayoutToast({ claims, onClose }) {
  const approved = claims.filter(c => c.status !== 'flagged');
  const isFraud  = approved.length === 0 && claims.length > 0;
  const total    = approved.reduce((s, c) => s + (c.payoutAmount || 0), 0);
  return (
    <div className="fixed bottom-6 right-6 z-50 payout-reveal max-w-sm w-full">
      <div className="rounded-2xl p-5 shadow-2xl"
        style={{
          background:  '#16232f',
          border:      `1px solid ${isFraud ? 'rgba(255,77,109,0.4)' : 'rgba(0,229,160,0.4)'}`,
          boxShadow:   `0 8px 40px ${isFraud ? 'rgba(255,77,109,0.2)' : 'rgba(0,229,160,0.2)'}`
        }}>
        <div className="flex items-start gap-4">
          <div className="text-3xl">{isFraud ? '🚨' : '💸'}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${isFraud ? 'text-[#ff4d6d]' : 'text-[#00e5a0]'}`}>
              {isFraud ? 'Fraud Alert — Payout Held' : 'Auto-Payout Successful'}
            </p>
            {isFraud ? (
              <>
                <p className="font-display font-bold text-xl text-white">Location Mismatch</p>
                <p className="text-xs text-[#7a9ab5] mt-1">Claim flagged for manual review. Payout withheld.</p>
              </>
            ) : (
              <>
                <p className="font-display font-bold text-3xl text-white">₹{total.toLocaleString()}</p>
                <p className="text-xs text-[#7a9ab5] mt-1">credited to your linked account</p>
                <p className="text-[10px] text-[#7a9ab5] font-mono mt-1">{new Date().toLocaleString('en-IN')}</p>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-[#7a9ab5] hover:text-white text-xl leading-none flex-shrink-0">×</button>
        </div>
        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] space-y-1">
          {claims.map((c, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-[#7a9ab5]">{TRIGGER_ICONS[c.triggerType]} {c.triggerLabel}</span>
              <span className={`font-mono ${c.status === 'flagged' ? 'text-[#ff4d6d]' : 'text-[#00e5a0]'}`}>
                {c.status === 'flagged' ? '⚠ held' : `₹${c.payoutAmount?.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnvPanel({ envData }) {
  if (!envData) return null;
  return (
    <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-4 space-y-4 slide-up">
      <p className="text-xs text-[#7a9ab5] uppercase tracking-widest">Live Environment Readings</p>
      <EnvMeter label="Rainfall"          value={envData.rainfall_mm}   unit="mm" max={100} warn={30}  danger={50}  />
      <EnvMeter label="Temperature"       value={envData.temperature_c} unit="°C" max={50}  warn={35}  danger={40}  />
      <EnvMeter label="Air Quality Index" value={envData.aqi}           unit=""   max={500} warn={150} danger={300} />
    </div>
  );
}

function TriggerStatusPanel({ city }) {
  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!city) return;
    setLoading(true);
    getTriggerStatus(city).then(setStatus).catch(() => {}).finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-5">
      <p className="text-xs text-[#7a9ab5] uppercase tracking-widest mb-3">Current Trigger Status</p>
      <div className="flex items-center gap-2 text-xs text-[#7a9ab5]">
        <span className="w-3 h-3 border border-[#7a9ab5] border-t-transparent rounded-full animate-spin" />
        Checking live conditions...
      </div>
    </div>
  );
  if (!status) return null;

  const safe = !status.isTriggered;
  const t    = status.thresholds || {};
  return (
    <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#7a9ab5] uppercase tracking-widest">Live Trigger Status · {city}</p>
        <Badge color={safe ? 'green' : 'red'}>{safe ? '✓ All Clear' : '⚡ Active Trigger'}</Badge>
      </div>
      <div className="space-y-3">
        {Object.values(t).map((item, i) => {
          const triggered = item.unit === 'mm' ? item.current > 50 : item.unit === '°C' ? item.current > 40 : item.current > 300;
          return (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-[#7a9ab5] flex items-center gap-2">
                {item.unit === 'mm' ? '🌧' : item.unit === '°C' ? '🌡' : '💨'} {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7a9ab5]">threshold &gt;{item.threshold}{item.unit}</span>
                <Badge color={triggered ? 'red' : 'green'}>{item.current}{item.unit}</Badge>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[#7a9ab5] mt-3 font-mono">
        Checked: {new Date(status.checkedAt).toLocaleTimeString('en-IN')}
      </p>
    </div>
  );
}

function TriggerLogsPanel() {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    getTriggerLogs().then(setLogs).catch(() => {});
  }, [open]);
  return (
    <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <span className="text-sm font-semibold text-white">Trigger Check Log</span>
        <span className="text-[#7a9ab5] text-xs">{open ? '▲ hide' : '▼ expand'}</span>
      </button>
      {open && (
        <div className="border-t border-[#243447] divide-y divide-[#243447] max-h-60 overflow-y-auto">
          {logs.length === 0
            ? <p className="p-4 text-xs text-[#7a9ab5]">No trigger checks logged yet.</p>
            : logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${log.triggered ? 'bg-[#ff4d6d]' : 'bg-[#00e5a0]'}`} />
                  <span className="text-[#7a9ab5] font-mono">{log.scenario}</span>
                  <span className="text-white">{log.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={log.triggered ? 'text-[#ff4d6d]' : 'text-[#00e5a0]'}>
                    {log.triggered ? `⚡ ${log.triggers?.length} trigger(s)` : '✓ all clear'}
                  </span>
                  <span className="text-[#7a9ab5] font-mono">
                    {new Date(log.checkedAt).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

function PolicyCard({ policy, onToggle, toggling }) {
  if (!policy) return null;
  return (
    <div className={`rounded-xl p-5 border glow-card ${policy.active ? 'gradient-border' : 'bg-[#1c2f3e] border-[#243447]'}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full pulse-dot ${policy.active ? 'bg-[#00e5a0]' : 'bg-[#7a9ab5]'}`} />
            <p className="text-xs text-[#7a9ab5] uppercase tracking-widest">Active Policy</p>
          </div>
          <p className="font-display font-bold text-white">Coverage: ₹{policy.coverageAmount?.toLocaleString()}</p>
          <p className="text-xs text-[#7a9ab5] mt-0.5">
            ₹{policy.weeklyPremium}/week · Policy #{String(policy._id).slice(-6)}
          </p>
        </div>
        <button
          onClick={onToggle} disabled={toggling}
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 border"
          style={{
            background:  policy.active ? 'rgba(255,77,109,0.1)' : 'rgba(0,229,160,0.1)',
            borderColor: policy.active ? 'rgba(255,77,109,0.3)' : 'rgba(0,229,160,0.3)',
            color:       policy.active ? '#ff4d6d' : '#00e5a0'
          }}>
          {toggling ? '...' : policy.active ? 'Deactivate Policy' : 'Activate Policy'}
        </button>
      </div>
      <p className={`mt-3 pt-3 border-t border-[#243447] text-xs ${policy.active ? 'text-[#00e5a0]' : 'text-[#7a9ab5]'}`}>
        {policy.active
          ? '✓ Auto-triggers active — parametric events will generate instant payouts'
          : '✗ Policy inactive — triggers will not generate payouts until reactivated'}
      </p>
    </div>
  );
}

function DbPill({ health }) {
  if (!health) return null;
  const ok = health.db?.includes('connected') && !health.db?.includes('dis');
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#7a9ab5]">
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#00e5a0]' : 'bg-[#ff7849]'}`} />
      {ok ? 'MongoDB' : 'Memory mode'}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage({ userId, onLogout }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [simLoading, setSimLoading] = useState('');
  const [simResult,  setSimResult]  = useState(null);
  const [payout,     setPayout]     = useState(null);
  const [toggling,   setToggling]   = useState(false);
  const [health,     setHealth]     = useState(null);
  const [alerts,     setAlerts]     = useState([]);
  const toastTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const result = await getUser(userId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    getHealth().then(setHealth).catch(() => {});
  }, [load]);

  useEffect(() => {
    if (!data?.user?.city) return;
    getTriggerStatus(data.user.city).then(status => {
      if (status.alerts) setAlerts(status.alerts);
    }).catch(() => {});
  }, [data?.user?.city]);

  const handleSimulate = async (scenario) => {
    setSimLoading(scenario); setSimResult(null); setPayout(null); setError('');
    clearTimeout(toastTimer.current);
    try {
      const result = await simulateClaim(userId, scenario, data?.user?.city);
      setSimResult(result);
      if (result.triggered && result.claims?.length > 0) {
        setPayout(result.claims);
        toastTimer.current = setTimeout(() => setPayout(null), 8000);
        setTimeout(load, 400);
      }
    } catch (err) { setError(err.message); }
    finally { setSimLoading(''); }
  };

  const handleFraudDemo = async () => {
    setSimLoading('fraud'); setSimResult(null); setPayout(null); setError('');
    try {
      const result = await simulateFraud(userId);
      setSimResult({ ...result, isFraudDemo: true });
      if (result.claims?.length > 0) {
        setPayout(result.claims);
        toastTimer.current = setTimeout(() => setPayout(null), 8000);
        setTimeout(load, 400);
      }
    } catch (err) { setError(err.message); }
    finally { setSimLoading(''); }
  };

  const handleTogglePolicy = async () => {
    if (!data?.policy) return;
    setToggling(true);
    try {
      const updated = await togglePolicy(data.policy._id);
      setData(d => ({ ...d, policy: updated }));
    } catch (err) { setError(err.message); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <Spinner />
    </div>
  );

  const { user, policy, claims = [] } = data || {};
  const totalPayout = claims.filter(c => c.status !== 'flagged').reduce((s, c) => s + (c.payoutAmount || 0), 0);
  const fraudIssues = claims.filter(c => c.fraudCheck?.passed === false).length;
  const approvedCnt = claims.filter(c => c.status === 'approved').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
      </div>

      {/* Navbar */}
      <header className="border-b border-[#243447] sticky top-0 z-40 backdrop-blur-md"
        style={{ background: 'rgba(15,25,35,0.92)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-display font-bold text-white text-lg">ParametriX</span>
            <span className="text-[#243447] mx-1.5">|</span>
            <span className="text-sm text-[#7a9ab5]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <DbPill health={health} />
            <div className="flex items-center gap-1.5 text-xs text-[#7a9ab5]">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot"
                style={{ background: policy?.active ? '#00e5a0' : '#7a9ab5' }} />
              {policy?.active ? 'Policy Active' : 'Policy Inactive'}
            </div>
            <button onClick={onLogout}
              className="text-xs text-[#7a9ab5] hover:text-white px-3 py-1.5 rounded-lg border border-[#243447] hover:border-[#7a9ab5] transition-all">
              ← New User
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {alerts.length > 0 && (
          <div className="rounded-xl p-4 border border-[#ff7849] bg-[rgba(255,120,73,0.05)] slide-up">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-[#ff7849] text-sm">Predictive Alerts</p>
                <div className="mt-2 space-y-1">
                  {alerts.map((alert, i) => (
                    <p key={i} className="text-xs text-[#7a9ab5]">• {alert.message}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {/* User Card */}
        <div className="gradient-border rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,229,160,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
                  👤
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-white">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge color="blue">📍 {user?.city}</Badge>
                    <Badge color="muted">💼 {user?.jobType}</Badge>
                    <Badge color="blue">🎭 {user?.persona}</Badge>
                    <Badge color={fraudIssues === 0 ? 'green' : 'red'}>
                      {fraudIssues === 0 ? '🛡 Fraud: Clear' : `⚠ ${fraudIssues} Flagged`}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#7a9ab5] font-mono mt-1">Worker ID: {user?._id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7a9ab5] uppercase tracking-widest mb-1">Weekly Income</p>
              <p className="font-mono font-bold text-2xl text-white">₹{Number(user?.weeklyIncome).toLocaleString()}</p>
              <p className="text-xs text-[#7a9ab5] mt-1">{approvedCnt} claim{approvedCnt !== 1 ? 's' : ''} approved</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Risk Score"     value={`${user?.riskScore}/100`}                       sub="Profile-based"  accent />
          <StatCard label="Trust Score"    value={`${user?.trustScore}/100`}                      sub="Payout speed"  />
          <StatCard label="Weekly Premium" value={`₹${user?.weeklyPremium}`}                      sub="Auto-deducted" />
          <StatCard label="Total Payouts"  value={`₹${totalPayout.toLocaleString()}`}              sub={`${approvedCnt} approved`} />
        </div>

        {/* Policy Card */}
        <PolicyCard policy={policy} onToggle={handleTogglePolicy} toggling={toggling} />

        {/* Premium Breakdown */}
        {user?.premiumBreakdown?.length > 0 && (
          <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-5">
            <SectionHeader title="Dynamic Premium Breakdown" subtitle="How your weekly premium is calculated from risk factors" />
            <div className="space-y-2">
              {user.premiumBreakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#7a9ab5] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#243447] inline-block" />
                    {b.label}
                  </span>
                  <span className={`font-mono text-sm font-medium ${b.sign === '+' ? 'text-[#ff7849]' : 'text-white'}`}>
                    {b.sign}₹{b.amount}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#243447] pt-2 mt-2 flex justify-between items-center">
                <span className="font-semibold text-white text-sm">Weekly Premium</span>
                <span className="font-mono font-bold text-[#00d4ff] text-lg">₹{user?.weeklyPremium}/week</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#7a9ab5]">Coverage (20× premium)</span>
                <span className="font-mono text-sm text-[#7a9ab5]">₹{policy?.coverageAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Trigger Status */}
        <div>
          <SectionHeader title="Live Trigger Status" subtitle={`Real-time parametric conditions for ${user?.city}`} />
          <TriggerStatusPanel city={user?.city} />
        </div>

        {/* Simulation Controls */}
        <div>
          <SectionHeader
            title="Parametric Trigger Simulator"
            subtitle="Trigger a scenario — the system auto-creates, auto-approves, and auto-credits claims with zero human touch"
          />

          {/* Scenario buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {SCENARIOS.map(s => (
              <button key={s.key} onClick={() => handleSimulate(s.key)} disabled={!!simLoading}
                className="relative rounded-xl p-4 text-left transition-all duration-200 disabled:opacity-60 glow-card"
                style={{
                  background: simLoading === s.key ? `rgba(${s.rgb},0.12)` : '#1c2f3e',
                  border: `1px solid ${simLoading === s.key ? s.color + '44' : '#243447'}`
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  {simLoading === s.key && (
                    <span className="w-3.5 h-3.5 border-2 border-transparent rounded-full animate-spin"
                      style={{ borderTopColor: s.color }} />
                  )}
                </div>
                <p className="font-display font-bold text-white text-xs leading-tight">{s.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Fraud demo */}
          <button onClick={handleFraudDemo} disabled={!!simLoading}
            className="w-full rounded-xl p-4 text-left transition-all duration-200 disabled:opacity-60 flex items-center gap-4 glow-card"
            style={{
              background: simLoading === 'fraud' ? 'rgba(255,77,109,0.1)' : '#1c2f3e',
              border: `1px solid ${simLoading === 'fraud' ? 'rgba(255,77,109,0.4)' : '#243447'}`
            }}>
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-sm">Simulate Fraud Attempt</p>
              <p className="text-xs text-[#ff4d6d] mt-0.5">
                Triggers rainstorm claim with location mismatch → marked "Suspicious Activity", payout withheld
              </p>
            </div>
            {simLoading === 'fraud'
              ? <span className="w-4 h-4 border-2 border-[#ff4d6d] border-t-transparent rounded-full animate-spin" />
              : <span className="text-[#7a9ab5]">→</span>
            }
          </button>

          {/* Result panel */}
          {simResult && (
            <div className="mt-4 space-y-3 slide-up">
              {simResult.isFraudDemo ? (
                <Alert type="warning">
                  🚨 Fraud simulation complete — location mismatch detected. Claim status: <strong>Flagged</strong>. Payout withheld pending review.
                </Alert>
              ) : simResult.triggered ? (
                <Alert type="success">
                  ⚡ {simResult.claims?.length} claim(s) auto-triggered and approved — payout credited instantly. {simResult.isBoosted && 'Coverage was boosted due to high risk.'}
                </Alert>
              ) : (
                <Alert type="info">
                  ☀ Normal conditions — no parametric thresholds exceeded. Worker can operate safely today. No claim generated.
                </Alert>
              )}

              <EnvPanel envData={simResult.environment} />

              {simResult.triggers?.length > 0 && (
                <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-4">
                  <p className="text-xs text-[#7a9ab5] uppercase tracking-widest mb-3">Triggered Conditions</p>
                  <div className="space-y-2">
                    {simResult.triggers.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-white">
                          {TRIGGER_ICONS[t.type]} {t.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge color={TRIGGER_COLORS[t.type]}>{t.value}</Badge>
                          <span className="text-xs text-[#7a9ab5]">threshold: {t.threshold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {simResult.fraudCheck && (
                <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-4 flex items-center gap-3">
                  <span className="text-xl">{simResult.fraudCheck.passed ? '🛡' : '🚨'}</span>
                  <div>
                    <p className={`text-sm font-semibold ${simResult.fraudCheck.passed ? 'text-[#00e5a0]' : 'text-[#ff4d6d]'}`}>
                      {simResult.fraudCheck.passed ? 'Fraud Check Passed' : 'Suspicious Activity Detected'}
                    </p>
                    <p className="text-xs text-[#7a9ab5] mt-0.5">{simResult.fraudCheck.reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Claims History */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <SectionHeader
              title="Claims History"
              subtitle={`${claims.length} total · ${approvedCnt} approved · ${fraudIssues} flagged`}
            />
            <div className="flex gap-2 flex-wrap">
              {fraudIssues > 0 && <Badge color="red">⚠ {fraudIssues} Suspicious</Badge>}
              {approvedCnt  > 0 && <Badge color="green">✓ {approvedCnt} Approved</Badge>}
            </div>
          </div>
          {claims.length === 0 ? (
            <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-10 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-[#7a9ab5] text-sm">No claims yet. Simulate a weather event above.</p>
              <p className="text-[#7a9ab5] text-xs mt-1">Auto-created · Auto-approved · Auto-credited — zero touch.</p>
            </div>
          ) : (
            <div className="space-y-3">{claims.map(c => <ClaimCard key={c._id} claim={c} />)}</div>
          )}
        </div>

        {/* Fraud Detection Summary */}
        <div className="rounded-xl bg-[#1c2f3e] border border-[#243447] p-5">
          <SectionHeader title="Fraud Detection System" subtitle="Every parametric claim is verified against the worker's registered location" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total Claims',        val: claims.length,  color: 'text-white' },
              { label: 'Fraud Check Passed',  val: approvedCnt,    color: 'text-[#00e5a0]' },
              { label: 'Flagged / Suspicious', val: fraudIssues,   color: 'text-[#ff4d6d]' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3 bg-[#16232f] border border-[#243447] text-center">
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-[#7a9ab5] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${fraudIssues === 0
            ? 'bg-[rgba(0,229,160,0.05)] border-[rgba(0,229,160,0.15)]'
            : 'bg-[rgba(255,77,109,0.05)] border-[rgba(255,77,109,0.15)]'}`}>
            <span className="text-xl">{fraudIssues === 0 ? '🛡' : '⚠'}</span>
            <div>
              <p className={`text-sm font-semibold ${fraudIssues === 0 ? 'text-[#00e5a0]' : 'text-[#ff4d6d]'}`}>
                {fraudIssues === 0 ? 'All Claims Verified — Fraud Check Passed' : `${fraudIssues} Claim(s) Flagged — Manual Review Required`}
              </p>
              <p className="text-xs text-[#7a9ab5] mt-0.5">
                Detection rule: registered city must match parametric event location
              </p>
            </div>
          </div>
        </div>

        {/* Trigger Log */}
        <TriggerLogsPanel />

      </main>

      {payout && <PayoutToast claims={payout} onClose={() => setPayout(null)} />}
      <Chatbot userData={data} />
    </div>
  );
}
