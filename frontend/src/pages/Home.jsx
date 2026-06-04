import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, Users, Globe, ChevronRight, 
  BarChart, Layers, Target, LogOut, ChevronDown, Rocket, Command, FileCode2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../api/axios';

// Theme tokens specific to the landing page
const THEME = {
  bg: '#090A0B',
  surface: '#121417',
  border: 'rgba(255,255,255,0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  secondary: '#4F46E5',
  accent: '#06B6D4'
};

function LandingNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300" 
         style={{ 
           paddingTop: scrolled ? '1rem' : '1.5rem',
           pointerEvents: 'none'
         }}>
      <div className="w-full max-w-5xl px-4 sm:px-6 pointer-events-auto">
        <div className="flex items-center justify-between rounded-full px-4 sm:px-6 py-3"
             style={{ 
               background: scrolled ? 'rgba(18, 20, 23, 0.8)' : 'rgba(18, 20, 23, 0.5)',
               backdropFilter: 'blur(20px)',
               border: `1px solid ${THEME.border}`,
               boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.6)' : 'none'
             }}>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                 style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` }}>
              <Layers size={14} color="#fff" />
            </div>
            <span className="font-display font-semibold tracking-tight text-[15px]" style={{ color: THEME.text }}>
              EcoQuest
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Product', 'Solutions', 'Resources', 'Pricing'].map(l => (
              <a key={l} href="#" className="text-[13px] font-medium transition-colors"
                 style={{ color: THEME.textMuted }}
                 onMouseEnter={e => e.currentTarget.style.color = THEME.text}
                 onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}>
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} 
                        className="flex items-center gap-2 transition-opacity hover:opacity-80">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold" 
                       style={{ border: `1px solid ${THEME.border}`, background: THEME.surface, color: THEME.text }}>
                    {user.avatar ? (
                      <img src={fileUrl(user.avatar)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      user.name?.[0]
                    )}
                  </div>
                  <ChevronDown size={14} style={{ color: THEME.textMuted }} className="hidden sm:block" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl overflow-hidden shadow-2xl"
                       style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}>
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <p className="text-[13px] font-medium truncate" style={{ color: THEME.text }}>{user.name}</p>
                      <p className="text-[11px] mt-0.5 capitalize" style={{ color: THEME.textMuted }}>{user.role}</p>
                    </div>
                    <Link to={user.role === 'teacher' ? '/teacher' : '/dashboard'}
                          className="block px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors" style={{ color: THEME.text }}>
                      Go to Dashboard
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); }}
                            className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors" style={{ color: '#ef4444' }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-[13px] font-medium px-2" style={{ color: THEME.textMuted }}>
                  Sign in
                </Link>
                <Link to="/register" className="text-[12px] font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                      style={{ background: THEME.text, color: THEME.bg, boxShadow: '0 4px 14px rgba(255,255,255,0.1)' }}>
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function LandingFooter() {
  return (
    <footer className="py-16 px-6" style={{ borderTop: `1px solid ${THEME.border}`, background: THEME.bg }}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` }}>
              <Layers size={14} color="#fff" />
            </div>
            <span className="font-display font-semibold text-[16px]" style={{ color: THEME.text }}>EcoQuest</span>
          </div>
          <p className="text-[13px] leading-relaxed max-w-xs mb-6" style={{ color: THEME.textMuted }}>
            The enterprise-grade platform for modern environmental education. Build habits, track impact, and empower the next generation.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition-opacity hover:opacity-100 opacity-60" style={{ color: THEME.text }}><Globe size={18} /></a>
            <a href="#" className="transition-opacity hover:opacity-100 opacity-60" style={{ color: THEME.text }}><Users size={18} /></a>
          </div>
        </div>
        
        {[
          { title: 'Product', links: ['Features', 'Analytics', 'Teacher Portal', 'Pricing'] },
          { title: 'Developers', links: ['Documentation', 'API Reference', 'Status', 'GitHub'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] },
        ].map(col => (
          <div key={col.title} className="col-span-1">
            <h4 className="text-[13px] font-semibold mb-4" style={{ color: THEME.text }}>{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l}>
                  <a href="#" className="text-[13px] transition-colors" style={{ color: THEME.textMuted }}
                     onMouseEnter={e => e.currentTarget.style.color = THEME.text}
                     onMouseLeave={e => e.currentTarget.style.color = THEME.textMuted}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
           style={{ borderTop: `1px solid ${THEME.border}` }}>
        <p className="text-[12px]" style={{ color: THEME.textMuted }}>© 2026 EcoQuest Inc. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
          <span className="text-[12px]" style={{ color: THEME.textMuted }}>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ background: THEME.bg, color: THEME.text }}>
      <LandingNav />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-40 pointer-events-none"
             style={{ 
               background: `radial-gradient(ellipse, ${THEME.primary} 0%, transparent 70%)`,
               filter: 'blur(80px)'
             }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 pointer-events-none"
             style={{ 
               background: `radial-gradient(ellipse, ${THEME.secondary} 0%, transparent 60%)`,
               filter: 'blur(100px)'
             }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          <h1 className="font-display font-bold leading-[1.05] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
            Empowering the next <br />
            generation of <span style={{ color: THEME.primary }}>eco-leaders.</span>
          </h1>

          <p className="text-[17px] md:text-[19px] leading-relaxed max-w-2xl mx-auto mb-10"
             style={{ color: THEME.textMuted }}>
            The enterprise-grade platform combining structured learning with real-world civic action. Measure impact, verify tasks, and scale sustainability across your institution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto text-[14px] font-medium px-8 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: THEME.primary, color: '#fff', boxShadow: `0 8px 24px ${THEME.primaryGlow}` }}>
              Start for free
            </Link>
            <a href="#features" className="w-full sm:w-auto text-[14px] font-medium px-8 py-3.5 rounded-xl transition-all duration-300 hover:bg-white/5"
               style={{ border: `1px solid ${THEME.border}` }}>
              Explore platform
            </a>
          </div>
        </div>

        {/* High-fidelity dashboard preview */}
        <div className="relative z-10 mt-20 w-full max-w-5xl mx-auto perspective-1000">
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
               style={{ 
                 background: THEME.surface, 
                 border: `1px solid ${THEME.border}`,
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
               }}>
            {/* Header bar */}
            <div className="h-12 flex items-center px-4 gap-2" style={{ borderBottom: `1px solid ${THEME.border}`, background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
            </div>
            {/* Coded Medium-Fidelity EcoQuest Dashboard Preview */}
            <div className="grid grid-cols-4 bg-[#0a0f16] text-left border-t border-white/5" style={{ minHeight: '320px' }}>
              {/* Sidebar */}
              <div className="col-span-1 border-r border-white/10 p-4 space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                    <Layers size={10} color="#fff" />
                  </div>
                  <span className="font-bold text-[13px] tracking-tight text-white">EcoQuest</span>
                </div>
                <div className="space-y-1.5">
                  {['Dashboard', 'Civic Tasks', 'Leaderboard', 'Analytics'].map((item, i) => (
                    <div key={item} className={`px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-2 ${i === 0 ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400'}`}>
                      <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="col-span-3 p-6 space-y-6">
                {/* Header / Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Welcome back, Student!</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap size={10} className="text-blue-400" />
                      <p className="text-[11px] text-gray-400">Level 4 Eco-Warrior • 2,450 XP</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Current Streak</p>
                    <p className="text-[13px] font-bold text-amber-400">12 Days 🔥</p>
                  </div>
                </div>
                
                {/* Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tasks */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-[11px] font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                      <Target size={12} className="text-blue-400"/> Pending Tasks
                    </h4>
                    <div className="space-y-2">
                      {[
                        { title: 'Plant a Sapling', xp: '+500 XP', color: 'text-green-400', bg: 'bg-green-400/20' },
                        { title: 'Recycle Plastic', xp: '+200 XP', color: 'text-blue-400', bg: 'bg-blue-400/20' }
                      ].map(t => (
                        <div key={t.title} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                          <span className="text-[11px] font-medium text-gray-200">{t.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${t.color} ${t.bg}`}>{t.xp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Leaderboard */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-[11px] font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                      <BarChart size={12} className="text-indigo-400"/> Leaderboard
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Alex M.', score: '4,200', rank: '🥇' },
                        { name: 'Sarah K.', score: '3,850', rank: '🥈' },
                        { name: 'You', score: '2,450', rank: '#12' },
                      ].map((u, i) => (
                        <div key={u.name} className={`flex items-center justify-between p-1.5 rounded ${i === 2 ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-transparent'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] w-4 text-center">{u.rank}</span>
                            <span className="text-[11px] font-medium text-gray-200">{u.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{u.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-16 px-6" style={{ borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x" style={{ borderColor: THEME.border }}>
          {[
            { value: '2M+', label: 'Eco Tasks Completed' },
            { value: '50k+', label: 'Active Students' },
            { value: '10k+', label: 'Trees Planted' },
            { value: '99%', label: 'Teacher Satisfaction' }
          ].map((s, i) => (
            <div key={i} className="text-center px-4">
              <p className="font-display text-4xl font-light mb-2 tracking-tight" style={{ color: THEME.text }}>{s.value}</p>
              <p className="text-[13px] font-medium uppercase tracking-wider" style={{ color: THEME.textMuted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ZIGZAG FEATURES ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-32">
          
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                   style={{ background: `linear-gradient(135deg, ${THEME.primary}30, transparent)`, border: `1px solid ${THEME.primary}40` }}>
                <Target size={20} style={{ color: THEME.primary }} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: THEME.text }}>Action-Driven Learning</h2>
              <p className="text-[16px] leading-relaxed mb-8" style={{ color: THEME.textMuted }}>
                Move beyond the classroom. Our Civic Action Engine assigns students real-world environmental tasks, verifying completion through a seamless photo upload process.
              </p>
              <ul className="space-y-4">
                {['Verified photo submissions', 'Gamified XP rewards', 'Real-time task tracking'].map(li => (
                  <li key={li} className="flex items-center gap-3 text-[14px]" style={{ color: THEME.text }}>
                    <CheckCircle2 size={16} style={{ color: THEME.primary }} /> {li}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-2xl p-8 h-80 relative overflow-hidden flex items-center justify-center"
                 style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle, ${THEME.primary}, transparent)` }} />
              <div className="relative z-10 w-full max-w-sm rounded-xl p-4 shadow-2xl" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] font-medium">Task: Plant a Sapling</span>
                  <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400">+500 XP</span>
                </div>
                <div className="h-24 rounded-lg flex items-center justify-center mb-3" style={{ border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <span className="text-[12px] text-gray-500">Image Uploaded</span>
                </div>
                <div className="h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[12px] font-medium">Submit for Review</div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="rounded-2xl p-8 h-80 relative overflow-hidden flex items-center justify-center"
                 style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle, ${THEME.secondary}, transparent)` }} />
              <div className="relative z-10 w-full max-w-sm rounded-xl p-4 shadow-2xl" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  <span className="text-[12px] font-medium flex items-center gap-2"><Shield size={14} color={THEME.secondary}/> Pending Reviews</span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-indigo-500/20 text-indigo-400">3</span>
                </div>
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-800" />
                        <div className="h-3 w-16 bg-gray-800 rounded" />
                      </div>
                      <div className="flex gap-1">
                        <div className="w-5 h-5 rounded bg-green-500/20" />
                        <div className="w-5 h-5 rounded bg-red-500/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                   style={{ background: `linear-gradient(135deg, ${THEME.secondary}30, transparent)`, border: `1px solid ${THEME.secondary}40` }}>
                <Shield size={20} style={{ color: THEME.secondary }} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: THEME.text }}>Teacher Command Center</h2>
              <p className="text-[16px] leading-relaxed mb-8" style={{ color: THEME.textMuted }}>
                Maintain complete control over the curriculum. Review student submissions, distribute grades, manage quizzes, and orchestrate the entire learning experience from a unified dashboard.
              </p>
              <ul className="space-y-4">
                {['One-click submission approvals', 'Automated quiz grading', 'Class-wide performance insights'].map(li => (
                  <li key={li} className="flex items-center gap-3 text-[14px]" style={{ color: THEME.text }}>
                    <CheckCircle2 size={16} style={{ color: THEME.secondary }} /> {li}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                   style={{ background: `linear-gradient(135deg, ${THEME.accent}30, transparent)`, border: `1px solid ${THEME.accent}40` }}>
                <BarChart size={20} style={{ color: THEME.accent }} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: THEME.text }}>Data-Driven Consistency</h2>
              <p className="text-[16px] leading-relaxed mb-8" style={{ color: THEME.textMuted }}>
                Visualize progress instantly. Our robust analytics engine tracks daily habits via a developer-style heatmap and ranks performance on a global leaderboard.
              </p>
              <ul className="space-y-4">
                {['Activity heatmaps', 'Dynamic level progression', 'Multi-tier leaderboards'].map(li => (
                  <li key={li} className="flex items-center gap-3 text-[14px]" style={{ color: THEME.text }}>
                    <CheckCircle2 size={16} style={{ color: THEME.accent }} /> {li}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-8 h-80 relative overflow-hidden flex items-center justify-center"
                 style={{ background: THEME.surface, border: `1px solid ${THEME.border}` }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle, ${THEME.accent}, transparent)` }} />
              <div className="relative z-10 w-full rounded-xl p-5 shadow-2xl" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-[11px] font-medium text-cyan-400">Activity Heatmap</span>
                </div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const r = Math.random();
                    const bg = r > 0.8 ? '#06b6d4' : r > 0.5 ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.05)';
                    return <div key={i} className="aspect-square rounded-[2px]" style={{ background: bg }} />
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 px-6 mb-12">
        <div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
             style={{ 
               background: `linear-gradient(135deg, ${THEME.surface} 0%, #1e1e24 100%)`, 
               border: `1px solid ${THEME.border}`,
               boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
             }}>
          
          <div className="absolute inset-0 pointer-events-none opacity-50"
               style={{ background: `radial-gradient(circle at center, ${THEME.primary} 0%, transparent 70%)`, filter: 'blur(60px)' }} />

          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to scale your impact?</h2>
            <p className="text-[17px] max-w-xl mx-auto mb-10" style={{ color: THEME.textMuted }}>
              Join thousands of students and educators actively building a sustainable future. Deployment takes less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto text-[14px] font-medium px-8 py-3.5 rounded-xl transition-transform hover:scale-105"
                    style={{ background: THEME.text, color: THEME.bg }}>
                Start your journey
              </Link>
              <Link to="/login" className="w-full sm:w-auto text-[14px] font-medium px-8 py-3.5 rounded-xl transition-colors hover:bg-white/10"
                    style={{ border: `1px solid ${THEME.border}`, color: THEME.text }}>
                Sign in to dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
