import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const interests = ['Waste Management','Water Conservation','Energy Saving','Plantation','Cleanliness','Recycling','Climate Action'];
const levels = [
  { value:'beginner', label:'Beginner', desc:'New to environmental awareness' },
  { value:'intermediate', label:'Intermediate', desc:'Know the basics, want to do more' },
  { value:'advanced', label:'Advanced', desc:'Actively working on eco causes' },
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
      title: 'Welcome to EcoQuest! 🌍',
      sub: "Let's personalize your journey",
      content: (
        <div className="text-center space-y-4">
          <div className="text-5xl">🌱</div>
          <p className="text-white/50 text-sm leading-relaxed">Start your eco journey, earn XP by completing real tasks, and make a measurable impact on the planet.</p>
          <div className="grid grid-cols-3 gap-2">
            {['🏆 Earn XP','🌿 Real Tasks','👨‍🏫 Teacher Led'].map(f => (
              <div key={f} className="bg-white/5 border border-white/8 rounded-xl py-2 text-xs text-center text-white/60">{f}</div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'What interests you?',
      sub: 'Select your eco focus areas',
      content: (
        <div className="flex flex-wrap gap-2 justify-center">
          {interests.map(i => (
            <button key={i} onClick={() => toggle(i)}
              className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                selected.includes(i) ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
              }`}>{i}</button>
          ))}
        </div>
      ),
    },
    {
      title: 'Your eco level?',
      sub: 'Helps your teacher assign the right tasks',
      content: (
        <div className="space-y-2">
          {levels.map(l => (
            <button key={l.value} onClick={() => setLevel(l.value)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                level === l.value ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}>
              <p className={`font-semibold text-sm ${level === l.value ? 'text-black' : ''}`}>{l.label}</p>
              <p className={`text-xs mt-0.5 ${level === l.value ? 'text-black/50' : 'text-white/40'}`}>{l.desc}</p>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const cur = steps[step];

  return (
    <div className="min-h-screen bg-black bw-theme flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in-up">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_,i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/15'}`} />)}
        </div>
        <div className="bg-[#1c1c1e] border border-white/8 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-0.5">{cur.title}</h2>
          <p className="text-white/40 text-xs mb-5">{cur.sub}</p>
          {cur.content}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s-1)} className="flex items-center gap-1 border border-white/20 text-white/50 px-4 py-2.5 rounded-xl hover:bg-white/5 transition text-sm">
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={step < steps.length-1 ? () => setStep(s => s+1) : finish}
              disabled={loading}
              className="flex-1 bg-eco-600 hover:bg-eco-500 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 transition text-sm flex items-center justify-center gap-1.5">
              {step < steps.length-1 ? <>Next <ArrowRight size={14} /></> : loading ? 'Setting up...' : "Let's Go! 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
