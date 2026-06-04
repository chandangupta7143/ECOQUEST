import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, Leaf, Zap, Users,
  Trash2, Droplets, Sun, TreePine, Sparkles, Recycle, Wind, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INTEREST_CONFIG = [
  { label: 'Waste Management', icon: Trash2,  color: '#ff4757', bg: 'rgba(255,71,87,0.10)',   border: 'rgba(255,71,87,0.25)'  },
  { label: 'Water Conservation', icon: Droplets, color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',  border: 'rgba(0,212,255,0.25)'  },
  { label: 'Energy Saving',     icon: Zap,     color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)' },
  { label: 'Plantation',        icon: TreePine, color: '#3b82f6', bg: 'rgba(59, 130, 246,0.10)',  border: 'rgba(59, 130, 246,0.25)'  },
  { label: 'Cleanliness',       icon: Sparkles, color: '#a855f7', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.25)' },
  { label: 'Recycling',         icon: Recycle,  color: '#3b82f6', bg: 'rgba(59, 130, 246,0.10)',  border: 'rgba(59, 130, 246,0.25)'  },
  { label: 'Climate Action',    icon: Wind,    color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',  border: 'rgba(0,212,255,0.25)'  },
];

const levels = [
  { value: 'beginner',     label: 'Beginner',     desc: 'New to environmental awareness',    icon: '🌱', color: '#3b82f6' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Know the basics, want to do more',  icon: '🌿', color: '#fbbf24' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Actively working on eco causes',    icon: '🌳', color: '#a855f7' },
];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (i) => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const finish = async () => {
    setLoading(true);
    try {
      await api.put('/users/me', { interests: selected, ecoLevel: level });
      await refreshUser();
    } catch {} finally {
      navigate(user?.role === 'teacher' ? '/teacher' : '/dashboard');
    }
  };

  const steps = [
    {
      title: 'Welcome to EcoQuest!',
      sub: "Let's personalize your eco journey",
      content: (
        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl"
            style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.25)', boxShadow: '0 0 30px rgba(37, 99, 235,0.15)' }}>
            🌱
          </div>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
            Start your eco journey, earn XP by completing real tasks, and make a measurable impact on the planet.
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: '🏆', label: 'Earn XP' },
              { icon: '🌿', label: 'Real Tasks' },
              { icon: '👨‍🏫', label: 'Teacher Led' },
            ].map(f => (
              <div key={f.label} className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <span className="text-xl">{f.icon}</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'What interests you?',
      sub: 'Select your eco focus areas — choose as many as you like',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {INTEREST_CONFIG.map(({ label, icon: Icon, color, bg, border }) => {
            const isSelected = selected.includes(label);
            return (
              <button key={label} onClick={() => toggle(label)}
                className="relative flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 hover-lift"
                style={{
                  background: isSelected ? bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? border : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 16px ${bg}` : 'none',
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isSelected ? bg : 'rgba(255,255,255,0.05)', border: `1px solid ${isSelected ? border : 'var(--border)'}` }}>
                  <Icon size={16} style={{ color: isSelected ? color : 'var(--text-3)' }} />
                </div>
                <span className="text-[12px] font-semibold flex-1 leading-tight"
                  style={{ color: isSelected ? color : 'var(--text-2)' }}>
                  {label}
                </span>
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: color }}>
                    <Check size={10} color="#000" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Your eco level?',
      sub: 'Helps your teacher assign the right tasks for you',
      content: (
        <div className="space-y-3">
          {levels.map(l => {
            const isSelected = level === l.value;
            return (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover-lift"
                style={{
                  background: isSelected ? 'rgba(37, 99, 235,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? 'rgba(37, 99, 235,0.30)' : 'var(--border)'}`,
                  boxShadow: isSelected ? '0 0 20px rgba(37, 99, 235,0.10)' : 'none',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: isSelected ? 'rgba(37, 99, 235,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? 'rgba(37, 99, 235,0.25)' : 'var(--border)'}`,
                  }}>
                  {l.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold mb-0.5"
                    style={{ color: isSelected ? '#3b82f6' : 'var(--text)' }}>
                    {l.label}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{l.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#3b82f6' }}>
                    <Check size={12} color="#000" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const canProceed = step === 0 ? true : step === 1 ? selected.length > 0 : !!level;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37, 99, 235,0.05), transparent)' }} />
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      <div className="w-full max-w-md fade-in-up relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(37, 99, 235,0.15)', border: '1px solid rgba(37, 99, 235,0.30)' }}>
            <Leaf size={18} style={{ color: '#3b82f6' }} />
          </div>
          <span className="font-display text-lg font-bold">EcoQuest</span>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{
                background: i <= step
                  ? 'linear-gradient(90deg, #2563eb, #3b82f6)'
                  : 'var(--tile)',
                boxShadow: i <= step ? '0 0 8px rgba(59, 130, 246,0.30)' : 'none',
              }} />
          ))}
        </div>

        {/* Step label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg"
            style={{ background: 'rgba(59, 130, 246,0.10)', border: '1px solid rgba(59, 130, 246,0.20)', color: '#3b82f6' }}>
            Step {step + 1}/{steps.length}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6"
          style={{ background: 'var(--card)', border: '1px solid var(--border-md)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <h2 className="font-display text-xl font-bold mb-1">{cur.title}</h2>
          <p className="text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>{cur.sub}</p>

          {cur.content}

          {/* Hint for step 1 */}
          {step === 1 && selected.length === 0 && (
            <p className="text-center text-[12px] mt-3" style={{ color: 'var(--text-4)' }}>
              Select at least one interest to continue
            </p>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 btn-secondary px-4 py-2.5 text-[13px]">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={step < steps.length - 1 ? () => setStep(s => s + 1) : finish}
              disabled={loading || !canProceed}
              className="flex-1 btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 py-2.5 text-[14px]">
              {step < steps.length - 1
                ? <><span>Next</span><ArrowRight size={15} /></>
                : loading
                  ? <><Leaf size={14} className="animate-spin" /> Setting up…</>
                  : <><span>Let's Go!</span><span>🚀</span></>
              }
            </button>
          </div>
        </div>

        {/* Selection count for step 1 */}
        {step === 1 && selected.length > 0 && (
          <p className="text-center mt-3 text-[12px]" style={{ color: 'var(--text-3)' }}>
            <span style={{ color: '#3b82f6' }}>{selected.length}</span> interest{selected.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
