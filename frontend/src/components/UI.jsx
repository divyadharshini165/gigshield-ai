import React from 'react';

export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]',
    green: 'bg-[rgba(0,229,160,0.1)] text-[#00e5a0] border border-[rgba(0,229,160,0.2)]',
    orange: 'bg-[rgba(255,120,73,0.1)] text-[#ff7849] border border-[rgba(255,120,73,0.2)]',
    red: 'bg-[rgba(255,77,109,0.1)] text-[#ff4d6d] border border-[rgba(255,77,109,0.2)]',
    muted: 'bg-[rgba(122,154,181,0.1)] text-[#7a9ab5] border border-[rgba(122,154,181,0.2)]'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${colors[color]}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-xl p-4 glow-card ${accent ? 'gradient-border' : 'bg-[#1c2f3e]'}`}>
      <p className="text-xs text-[#7a9ab5] uppercase tracking-widest mb-1 font-body">{label}</p>
      <p className={`text-2xl font-display font-bold ${accent ? 'text-[#00d4ff]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#7a9ab5] mt-1">{sub}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-[#243447] rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-[#00d4ff] rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export function Alert({ type = 'info', children, onClose }) {
  const styles = {
    success: 'bg-[rgba(0,229,160,0.08)] border-[rgba(0,229,160,0.3)] text-[#00e5a0]',
    error: 'bg-[rgba(255,77,109,0.08)] border-[rgba(255,77,109,0.3)] text-[#ff4d6d]',
    info: 'bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.3)] text-[#00d4ff]',
    warning: 'bg-[rgba(255,120,73,0.08)] border-[rgba(255,120,73,0.3)] text-[#ff7849]'
  };
  const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm slide-up ${styles[type]}`}>
      <span className="text-base font-bold flex-shrink-0 mt-0.5">{icons[type]}</span>
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-display font-bold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-[#7a9ab5] mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function EnvMeter({ label, value, unit, max, danger, warn }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= danger ? '#ff4d6d' : value >= warn ? '#ff7849' : '#00e5a0';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#7a9ab5]">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-[#243447] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#7a9ab5]">
        <span>0</span>
        <span className="text-[#ff7849]">▲{warn}{unit}</span>
        <span className="text-[#ff4d6d]">▲{danger}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
