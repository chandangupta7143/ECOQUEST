import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { Star, CheckCircle, Clock, FileText, Users, TrendingUp, BarChart2, Zap, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HeatMap from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ─── Design tokens ─── */
const ACCENT   = '#2563eb';
const ACCENT_B = '#3b82f6';
const CYAN     = '#00d4ff';
const AMBER    = '#fbbf24';
const PURPLE   = '#a855f7';
const RED      = '#ff4757';

const CHART_COLORS = [ACCENT, CYAN, AMBER, PURPLE, RED, '#38bdf8', '#fb923c', '#4ade80'];

const tooltipStyle = {
  background: 'rgba(12,12,12,0.95)',
  border: '1px solid rgba(37, 99, 235,0.20)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

/* ─── Custom Pie label ─── */
const PieLabel = ({ name, x, y, cx }) => (
  <text
    x={x} y={y}
    fill="rgba(255,255,255,0.45)"
    textAnchor={x > cx ? 'start' : 'end'}
    dominantBaseline="central"
    fontSize={10}
    fontFamily="'JetBrains Mono', monospace"
  >
    {name}
  </text>
);

/* ─── KPI Card ─── */
const KPICard = ({ icon: Icon, label, value, accent, delay = 0, sub }) => (
  <div
    className="card-glow rounded-2xl p-5 flex flex-col gap-3 hover-lift fade-in-up relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background glow */}
    <div
      aria-hidden
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${accent || ACCENT}, transparent 70%)` }}
    />

    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${accent || ACCENT}22, ${accent || ACCENT}08)`,
        border: `1px solid ${accent || ACCENT}40`,
      }}
    >
      <Icon size={16} style={{ color: accent || ACCENT }} />
    </div>

    <div>
      <p
        className="font-display text-3xl font-bold tracking-tight"
        style={{ color: 'var(--text)' }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: accent || ACCENT }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Section header ─── */
const SectionHeader = ({ icon: Icon, title, accent }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${accent || ACCENT}20, ${accent || ACCENT}06)`,
        border: `1px solid ${accent || ACCENT}35`,
      }}
    >
      <Icon size={13} style={{ color: accent || ACCENT }} />
    </div>
    <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
    <div
      className="flex-1 h-px"
      style={{ background: `linear-gradient(90deg, ${accent || ACCENT}25, transparent)` }}
    />
  </div>
);

/* ─── Chart card wrapper ─── */
const ChartCard = ({ children, className = '' }) => (
  <div
    className={`card-glow rounded-2xl p-5 ${className}`}
  >
    {children}
  </div>
);

/* ─── Category mastery bar ─── */
const MasteryBar = ({ cat, pct, i }) => {
  const colors = [ACCENT, CYAN, AMBER, PURPLE];
  const c = colors[i % colors.length];
  return (
    <div>
      <div className="flex justify-between items-center text-[12px] mb-1.5">
        <span className="capitalize font-medium" style={{ color: 'var(--text-2)' }}>{cat}</span>
        <span className="mono font-bold" style={{ color: c }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${c}, ${c}80)`,
            boxShadow: `0 0 8px ${c}50`,
          }}
        />
      </div>
    </div>
  );
};

/* ─── Main ─── */
export default function Analytics() {
  const { user }      = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user?.role === 'teacher' ? '/analytics/teacher' : '/analytics/student';
    api.get(endpoint)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role]);

  /* Loading state */
  if (loading) return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-6 pb-20 md:pb-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235,0.18), rgba(37, 99, 235,0.05))',
                border: '1px solid rgba(37, 99, 235,0.25)',
              }}
            >
              <BarChart2 size={20} style={{ color: ACCENT, animation: 'pulse 1.5s infinite' }} />
            </div>
            <p className="text-[13px] animate-pulse" style={{ color: 'var(--text-3)' }}>Loading analytics…</p>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-4 md:p-8 pb-24 md:pb-8">

          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none fixed top-0 right-0 w-[500px] h-[300px] opacity-10"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(0,212,255,0.3), transparent 60%)', zIndex: 0 }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[250px] opacity-10"
            style={{ background: 'radial-gradient(ellipse at bottom left, rgba(37, 99, 235,0.3), transparent 60%)', zIndex: 0 }}
          />

          <div className="max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4 mb-8 fade-in-up">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(0,212,255,0.05))',
                  border: '1px solid rgba(0,212,255,0.28)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.12)',
                }}
              >
                <BarChart2 size={20} style={{ color: CYAN }} />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                  Analytics
                </h1>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {user?.role === 'teacher' ? 'Class performance overview · Real-time insights' : 'Your learning progress · Powered by data'}
                </p>
              </div>
            </div>

            {/* ══════════════════ STUDENT ══════════════════ */}
            {user?.role === 'student' && data && (
              <div className="space-y-6">

                {/* KPI bento */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard icon={Star}        label="Total XP"       value={data.user?.xp || 0}          accent={ACCENT}  delay={0}   />
                  <KPICard icon={CheckCircle} label="Approved Tasks"  value={data.approvedSubmissions}     accent={CYAN}    delay={60}  />
                  <KPICard icon={Clock}       label="Pending Review"  value={data.pendingSubmissions}      accent={AMBER}   delay={120} />
                  <KPICard icon={FileText}    label="Quizzes Taken"   value={data.totalQuizAttempts}       accent={PURPLE}  delay={180} />
                </div>

                {/* XP area chart */}
                <ChartCard>
                  <SectionHeader icon={TrendingUp} title="XP Earned — Last 14 Days" accent={ACCENT} />
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.xpChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.30} />
                          <stop offset="95%" stopColor={ACCENT} stopOpacity={0.00} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(37, 99, 235,0.20)', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke={ACCENT}
                        strokeWidth={2.5}
                        fill="url(#xpGrad)"
                        dot={{ fill: ACCENT, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: ACCENT_B, strokeWidth: 0, style: { filter: `drop-shadow(0 0 6px ${ACCENT})` } }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Category mastery + Pie */}
                <div className="grid md:grid-cols-2 gap-4">
                  <ChartCard>
                    <SectionHeader icon={Award} title="Category Mastery" accent={CYAN} />
                    <div className="space-y-4">
                      {Object.entries(data.categoryStats || {}).map(([cat, pct], i) => (
                        <MasteryBar key={cat} cat={cat} pct={pct} i={i} />
                      ))}
                    </div>
                  </ChartCard>

                  {data.categoryDist?.length > 0 && (
                    <ChartCard>
                      <SectionHeader icon={Zap} title="Tasks by Category" accent={AMBER} />
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <defs>
                            {CHART_COLORS.map((c, i) => (
                              <radialGradient key={i} id={`pgrad${i}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%"   stopColor={c} stopOpacity={1}   />
                                <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                              </radialGradient>
                            ))}
                          </defs>
                          <Pie
                            data={data.categoryDist}
                            cx="50%" cy="50%"
                            outerRadius={72}
                            innerRadius={30}
                            dataKey="value"
                            label={PieLabel}
                            labelLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                            strokeWidth={0}
                          >
                            {data.categoryDist.map((_, i) => (
                              <Cell key={i} fill={`url(#pgrad${i % CHART_COLORS.length})`} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}
                </div>

                {/* Activity Heatmap */}
                <ChartCard>
                  <SectionHeader icon={BarChart2} title="Activity Heatmap" accent={PURPLE} />
                  <HeatMap activityLog={data.user?.activityLog || []} />
                </ChartCard>

                {/* Recent quiz attempts */}
                {data.recentAttempts?.length > 0 && (
                  <ChartCard>
                    <SectionHeader icon={FileText} title="Recent Quiz Attempts" accent={CYAN} />
                    <div className="space-y-2">
                      {data.recentAttempts.map((a, i) => {
                        const pct = a.score || 0;
                        const scoreColor = pct >= 80 ? ACCENT : pct >= 50 ? AMBER : RED;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all hover:scale-[1.01]"
                            style={{
                              background: 'rgba(255,255,255,0.025)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                                {a.quiz?.title || 'Quiz'}
                              </p>
                              <p className="text-[11px] mono mt-0.5" style={{ color: 'var(--text-3)' }}>
                                {new Date(a.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className="mono text-[14px] font-bold px-2 py-0.5 rounded-lg"
                                style={{
                                  color: scoreColor,
                                  background: `${scoreColor}15`,
                                  border: `1px solid ${scoreColor}30`,
                                }}
                              >
                                {pct}%
                              </span>
                              <span
                                className="mono text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                                style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}
                              >
                                +{a.xpEarned} XP
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ChartCard>
                )}
              </div>
            )}

            {/* ══════════════════ TEACHER ══════════════════ */}
            {user?.role === 'teacher' && data && (
              <div className="space-y-6">

                {/* KPI bento */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard icon={Users}       label="Total Students"  value={data.totalStudents}  accent={CYAN}    delay={0}   />
                  <KPICard icon={CheckCircle} label="Approved Tasks"  value={data.approvedCount}  accent={ACCENT}  delay={60}  />
                  <KPICard icon={Clock}       label="Pending Reviews" value={data.pendingReviews} accent={AMBER}   delay={120} />
                  <KPICard icon={TrendingUp}  label="Average XP"      value={data.avgXP}          accent={PURPLE}  delay={180} />
                </div>

                {/* Submissions area chart */}
                <ChartCard>
                  <SectionHeader icon={TrendingUp} title="Submissions — Last 14 Days" accent={CYAN} />
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.activityChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={CYAN} stopOpacity={0.28} />
                          <stop offset="95%" stopColor={CYAN} stopOpacity={0.00} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(0,212,255,0.20)', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={CYAN}
                        strokeWidth={2.5}
                        fill="url(#subGrad)"
                        dot={{ fill: CYAN, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: CYAN, strokeWidth: 0, style: { filter: `drop-shadow(0 0 6px ${CYAN})` } }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Distribution pies */}
                <div className="grid md:grid-cols-2 gap-4">
                  {data.statusDist?.length > 0 && (
                    <ChartCard>
                      <SectionHeader icon={CheckCircle} title="Submission Status" accent={ACCENT} />
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <defs>
                            {CHART_COLORS.map((c, i) => (
                              <radialGradient key={i} id={`tgrad${i}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%"   stopColor={c} stopOpacity={1}   />
                                <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                              </radialGradient>
                            ))}
                          </defs>
                          <Pie
                            data={data.statusDist}
                            cx="50%" cy="50%"
                            outerRadius={72}
                            innerRadius={30}
                            dataKey="value"
                            label={PieLabel}
                            labelLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                            strokeWidth={0}
                          >
                            {data.statusDist.map((_, i) => (
                              <Cell key={i} fill={`url(#tgrad${i % CHART_COLORS.length})`} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}

                  {data.categoryDist?.length > 0 && (
                    <ChartCard>
                      <SectionHeader icon={Zap} title="Tasks by Category" accent={AMBER} />
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <defs>
                            {CHART_COLORS.map((c, i) => (
                              <radialGradient key={i} id={`cgrad${i}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%"   stopColor={c} stopOpacity={1}   />
                                <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                              </radialGradient>
                            ))}
                          </defs>
                          <Pie
                            data={data.categoryDist}
                            cx="50%" cy="50%"
                            outerRadius={72}
                            innerRadius={30}
                            dataKey="value"
                            label={PieLabel}
                            labelLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                            strokeWidth={0}
                          >
                            {data.categoryDist.map((_, i) => (
                              <Cell key={i} fill={`url(#cgrad${i % CHART_COLORS.length})`} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}
                </div>

                {/* Student performance table */}
                <div
                  className="card-glow rounded-2xl overflow-hidden"
                >
                  {/* Table header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${PURPLE}18`, border: `1px solid ${PURPLE}35` }}
                      >
                        <Users size={13} style={{ color: PURPLE }} />
                      </div>
                      <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Student Performance</h2>
                      <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(90deg, ${PURPLE}25, transparent)` }} />
                    </div>
                    {data.topStudents?.length > 0 && (
                      <span
                        className="mono text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: `${PURPLE}12`, color: PURPLE, border: `1px solid ${PURPLE}25` }}
                      >
                        {data.topStudents.length} students
                      </span>
                    )}
                  </div>

                  {/* Col headers */}
                  <div
                    className="grid px-6 py-2.5"
                    style={{
                      gridTemplateColumns: '1fr auto auto auto auto',
                      borderBottom: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {['Name', 'Class', 'XP', 'Level', 'Streak'].map((h, idx) => (
                      <span
                        key={h}
                        className={`text-[11px] font-semibold uppercase tracking-wider ${idx === 0 ? '' : 'text-right'} ${idx >= 3 ? 'hidden md:block' : ''} ${idx === 1 ? 'hidden sm:block' : ''}`}
                        style={{ color: 'var(--text-3)' }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Rows */}
                  {data.topStudents?.map((s, i) => (
                    <div
                      key={s.id}
                      className="grid items-center px-6 py-3.5 transition-all duration-100 hover:bg-white/[0.02]"
                      style={{
                        gridTemplateColumns: '1fr auto auto auto auto',
                        borderBottom: i < data.topStudents.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {/* Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="mono text-[11px] font-bold w-5 text-center shrink-0"
                          style={{ color: i < 3 ? [AMBER, 'rgba(148,163,184,0.8)', '#cd7f32'][i] : 'var(--text-4)' }}
                        >
                          {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                          style={{ background: 'var(--tile)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-[13px] truncate" style={{ color: 'var(--text)' }}>{s.name}</span>
                      </div>

                      {/* Class */}
                      <span className="text-[12px] text-right hidden sm:block pl-4" style={{ color: 'var(--text-3)' }}>
                        {s.class}
                      </span>

                      {/* XP */}
                      <span
                        className="mono font-bold text-[13px] text-right pl-4"
                        style={{ color: ACCENT_B }}
                      >
                        {s.xp?.toLocaleString?.() ?? s.xp}
                      </span>

                      {/* Level */}
                      <span
                        className="mono text-[12px] text-right pl-4 hidden md:block"
                        style={{ color: CYAN }}
                      >
                        Lv.{s.level}
                      </span>

                      {/* Streak */}
                      <span
                        className="mono text-[12px] text-right pl-4 hidden md:block"
                        style={{ color: AMBER }}
                      >
                        {s.streak}🔥
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
