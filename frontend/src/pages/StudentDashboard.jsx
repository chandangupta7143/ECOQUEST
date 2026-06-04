import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, Flame, Trophy, BookOpen, Leaf, ArrowRight,
  CheckCircle, Clock, XCircle, Shield, Zap, Target,
  TrendingUp, Award, Activity, ChevronRight, Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HeatMap from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ─────────────────────────────────────────────
   XP / Level helpers (preserved exactly)
───────────────────────────────────────────── */
const levelThresholds = [0, 500, 1000, 2000, 3500, 5000, 7500, 10000];
function xpForNextLevel(level) { return levelThresholds[level] || level * 1500; }

/* ─────────────────────────────────────────────
   Status helpers
───────────────────────────────────────────── */
const statusConfig = {
  approved: { icon: CheckCircle, cls: 'badge-green',  label: 'Approved' },
  rejected: { icon: XCircle,     cls: 'badge-red',    label: 'Rejected' },
  pending:  { icon: Clock,       cls: 'badge-yellow', label: 'Pending'  },
};
function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`badge ${cfg.cls} flex items-center gap-1`}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

const catIcon = {
  waste: '♻️', water: '💧', energy: '⚡',
  cleanliness: '🧹', plantation: '🌱',
};

/* ─────────────────────────────────────────────
   Skeleton row placeholder
───────────────────────────────────────────── */
function SkeletonRows({ count = 3, h = 'h-14' }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${h} rounded-xl`} style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat pill (hero row)
───────────────────────────────────────────── */
function StatPill({ icon: Icon, label, value, color, glow }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl hover-lift"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}28`,
        boxShadow: `0 0 18px ${color}14`,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, boxShadow: `0 0 10px ${color}30` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="mono font-bold text-base leading-none" style={{ color }}>
          {value}
        </p>
        <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--text-3)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Quick Action Card
───────────────────────────────────────────── */
function QuickCard({ to, icon: Icon, label, sub, color, badge }) {
  return (
    <Link
      to={to}
      className="group relative rounded-[18px] p-5 flex flex-col gap-3 hover-lift hover-glow overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* ambient corner glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}25`,
            boxShadow: `0 0 14px ${color}18`,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {badge != null && (
          <span
            className="mono text-[11px] font-bold px-2 py-0.5 rounded-lg"
            style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-[14px] tracking-tight">{label}</p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</p>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color }}>
        Open <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Section header
───────────────────────────────────────────── */
function SectionHeader({ title, to, icon: Icon, color = 'var(--accent)' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={12} style={{ color }} />
          </div>
        )}
        <h2 className="font-semibold text-[13px] tracking-tight">{title}</h2>
      </div>
      {to && (
        <Link
          to={to}
          className="text-[11px] flex items-center gap-1 font-medium transition-all hover:gap-1.5"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-b)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          View all <ArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [rank, setRank]             = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    refreshUser();
    Promise.all([
      api.get('/tasks'),
      api.get('/submissions'),
      api.get('/leaderboard'),
    ]).then(([t, s, lb]) => {
      setTasks(t.data);
      setSubmissions(s.data);
      const me = lb.data.find((r) => r.id === user?.id || r.id === user?.id);
      setRank(me?.rank || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* ── Derived values (preserved) ── */
  const currentLevel = user?.level || 1;
  const currentXP    = user?.xp    || 0;
  const nextLevelXP  = xpForNextLevel(currentLevel);
  const baseXP       = xpForNextLevel(currentLevel - 1) || 0;
  const progress     = Math.min(100, Math.round(((currentXP - baseXP) / (nextLevelXP - baseXP)) * 100));
  const firstName    = user?.name?.split(' ')[0] || 'Student';

  const pendingTasks   = tasks.filter(t => !submissions.some(s => (s.task?.id || s.task) === t.id));
  const approvedCount  = submissions.filter(s => s.status === 'approved').length;
  const pendingCount   = submissions.filter(s => s.status === 'pending').length;

  /* ── Stats sidebar rows ── */
  const statsRows = [
    { label: 'Tasks Done',   value: approvedCount,        icon: CheckCircle, color: 'var(--accent)'  },
    { label: 'Pending',      value: pendingCount,          icon: Clock,       color: 'var(--amber)'   },
    { label: 'Streak',       value: `${user?.streak || 0}d`, icon: Flame,    color: '#fb923c'         },
    { label: 'Badges',       value: user?.badges?.length || 0, icon: Shield, color: 'var(--purple)'  },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
      </div>

      <Navbar />

      <div className="flex relative z-10">
        <Sidebar />

        <main className="flex-1 md:ml-[220px] pt-[58px] p-4 md:p-6 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* ══════════════════════════════════════════════
                HERO WELCOME CARD — full width
            ══════════════════════════════════════════════ */}
            <div
              className="rounded-[18px] p-6 md:p-7 fade-in-up hover-lift relative overflow-hidden"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border-md)',
                boxShadow: '0 0 40px rgba(59, 130, 246,0.05), var(--shadow-md)',
              }}
            >
              {/* decorative radial glow */}
              <div
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(37, 99, 235,0.07) 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
              />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative">
                {/* Left — greeting */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} style={{ color: 'var(--accent-b)' }} className="glow-pulse" />
                    <span className="label" style={{ color: 'var(--accent)' }}>Dashboard</span>
                  </div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                    Welcome back,{' '}
                    <span className="text-gradient-green">{firstName}!</span>{' '}
                    <span style={{ fontSize: '1.4rem' }}>👋</span>
                  </h1>
                  <p className="text-[13px] mt-1.5 flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-w)' }}
                    >
                      {user?.class || 'Class'}
                    </span>
                    <span>·</span>
                    <span>{user?.school || 'EcoQuest School'}</span>
                  </p>
                </div>

                {/* Right — stat pills */}
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <StatPill
                    icon={Star}
                    label="Total XP"
                    value={currentXP.toLocaleString()}
                    color="#3b82f6"
                  />
                  <StatPill
                    icon={Flame}
                    label="Day Streak"
                    value={`${user?.streak || 0}`}
                    color="#fb923c"
                  />
                  <StatPill
                    icon={Trophy}
                    label="Rank"
                    value={rank ? `#${rank}` : '—'}
                    color="#fbbf24"
                  />
                </div>
              </div>

              {/* Level progress bar */}
              <div
                className="mt-6 pt-5"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between text-[12px] mb-2.5">
                  <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-2)' }}>
                    <Zap size={12} style={{ color: 'var(--accent)' }} />
                    Level {currentLevel}
                  </span>
                  <span className="mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                    {(currentXP - baseXP).toLocaleString()} / {(nextLevelXP - baseXP).toLocaleString()} XP
                    <span className="ml-2" style={{ color: 'var(--accent-b)' }}>→ Level {currentLevel + 1}</span>
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--text-4)' }}>
                  <span>{progress}% complete</span>
                  <span>{(nextLevelXP - currentXP).toLocaleString()} XP to next level</span>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                QUICK ACTIONS — 3-col grid
            ══════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fade-in-up delay-75">
              <QuickCard
                to="/learn"
                icon={BookOpen}
                label="Tests & Quizzes"
                sub="Learn and earn XP"
                color="var(--cyan)"
              />
              <QuickCard
                to="/civic"
                icon={Leaf}
                label="Civic Tasks"
                sub="Complete eco challenges"
                color="var(--accent-b)"
                badge={pendingTasks.length > 0 ? `${pendingTasks.length} new` : null}
              />
              <QuickCard
                to="/leaderboard"
                icon={Trophy}
                label="Leaderboard"
                sub={rank ? `You're ranked #${rank}` : 'View rankings'}
                color="var(--amber)"
                badge={rank ? `#${rank}` : null}
              />
            </div>

            {/* ══════════════════════════════════════════════
                MAIN BENTO GRID — 2-col + 1-col
            ══════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-3 gap-5 fade-in-up delay-150">

              {/* ── Left column (lg:col-span-2) ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Available Tasks card */}
                <div
                  className="rounded-[18px] p-5 hover-glow"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <SectionHeader title="Available Tasks" to="/civic" icon={Target} color="var(--accent)" />

                  {loading ? (
                    <SkeletonRows count={4} h="h-[60px]" />
                  ) : pendingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(37, 99, 235,0.10)', border: '1px solid var(--border-md)' }}
                      >
                        <CheckCircle size={22} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-semibold">All caught up!</p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                          No pending tasks right now.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 4).map((task, i) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between rounded-xl px-4 py-3 group hover-lift"
                          style={{
                            background: 'var(--tile)',
                            border: '1px solid var(--border)',
                            animationDelay: `${i * 60}ms`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="text-lg w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
                              style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                              {catIcon[task.category] || '📋'}
                            </span>
                            <div>
                              <p className="text-[13px] font-semibold leading-tight">{task.title}</p>
                              <p className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-3)' }}>
                                {task.category}
                                {task.type && <span className="mx-1 opacity-40">·</span>}
                                {task.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className="mono text-[12px] font-bold px-2 py-0.5 rounded-lg"
                              style={{
                                color: 'var(--accent-b)',
                                background: 'rgba(37, 99, 235,0.10)',
                                border: '1px solid rgba(37, 99, 235,0.18)',
                              }}
                            >
                              +{task.xpReward} XP
                            </span>
                            <Link
                              to="/civic"
                              className="btn-primary text-[11px] font-bold"
                              style={{ padding: '0.3rem 0.75rem', borderRadius: '8px' }}
                            >
                              Do it
                            </Link>
                          </div>
                        </div>
                      ))}
                      {pendingTasks.length > 4 && (
                        <Link
                          to="/civic"
                          className="flex items-center justify-center gap-1.5 text-[12px] py-2.5 rounded-xl transition-colors"
                          style={{ color: 'var(--text-3)', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-b)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                        >
                          +{pendingTasks.length - 4} more tasks <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* My Submissions card */}
                <div
                  className="rounded-[18px] p-5 hover-glow"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <SectionHeader title="My Submissions" to="/civic" icon={TrendingUp} color="var(--cyan)" />

                  {loading ? (
                    <SkeletonRows count={4} h="h-[52px]" />
                  ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Activity size={22} style={{ color: 'var(--text-4)' }} />
                      <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>No submissions yet. Start a task!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {submissions.slice(0, 5).map((sub, i) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-xl px-4 py-3 hover-lift"
                          style={{
                            background: 'var(--tile)',
                            border: '1px solid var(--border)',
                            animationDelay: `${i * 60}ms`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate">{sub.task?.title || 'Task'}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0 ml-3">
                            {sub.teacherScore != null && (
                              <span className="mono text-[12px] font-semibold" style={{ color: 'var(--text-2)' }}>
                                {sub.teacherScore}/10
                              </span>
                            )}
                            {sub.xpAwarded > 0 && (
                              <span
                                className="mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                                style={{ color: 'var(--accent-b)', background: 'rgba(37, 99, 235,0.10)' }}
                              >
                                +{sub.xpAwarded}
                              </span>
                            )}
                            <StatusBadge status={sub.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right column ── */}
              <div className="space-y-5">

                {/* Activity HeatMap card */}
                <div
                  className="rounded-[18px] p-5 hover-glow"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <SectionHeader title="Activity" icon={Activity} color="var(--purple)" />
                  <HeatMap activityLog={user?.activityLog || []} />
                </div>

                {/* Stats card */}
                <div
                  className="rounded-[18px] p-5 hover-glow"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <SectionHeader title="Your Stats" icon={Award} color="var(--amber)" />

                  {loading ? (
                    <SkeletonRows count={4} h="h-9" />
                  ) : (
                    <div className="space-y-1">
                      {statsRows.map((stat, i) => (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 group transition-all"
                          style={{ animationDelay: `${i * 60}ms` }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-3)' }}>
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ background: `${stat.color}18` }}
                            >
                              <stat.icon size={11} style={{ color: stat.color }} />
                            </div>
                            {stat.label}
                          </span>
                          <span className="mono text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mini level badge */}
                  <div
                    className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 99, 235,0.08) 0%, rgba(0,212,255,0.05) 100%)',
                      border: '1px solid rgba(37, 99, 235,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={13} style={{ color: 'var(--accent-b)' }} />
                      <span className="text-[12px] font-semibold text-gradient-green">Level {currentLevel}</span>
                    </div>
                    <span className="mono text-[12px]" style={{ color: 'var(--text-3)' }}>
                      {currentXP.toLocaleString()} XP
                    </span>
                  </div>
                </div>

              </div>
            </div>
            {/* end bento grid */}

          </div>
        </main>
      </div>
    </div>
  );
}
