import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Flame, Trophy, BookOpen, Leaf, ArrowRight, CheckCircle, Clock, XCircle, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HeatMap from '../components/HeatMap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const levelThresholds = [0, 500, 1000, 2000, 3500, 5000, 7500, 10000];
function xpForNextLevel(level) { return levelThresholds[level] || level * 1500; }

const statusIcon = (s) => {
  if (s === 'approved') return <CheckCircle size={12} className="text-eco-400" />;
  if (s === 'rejected') return <XCircle size={12} className="text-red-400" />;
  return <Clock size={12} className="text-yellow-400" />;
};

const catIcon = { waste: '♻️', water: '💧', energy: '⚡', cleanliness: '🧹', plantation: '🌱' };

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    Promise.all([
      api.get('/tasks'),
      api.get('/submissions'),
      api.get('/leaderboard'),
    ]).then(([t, s, lb]) => {
      setTasks(t.data);
      setSubmissions(s.data);
      const me = lb.data.find((r) => r._id === user?._id || r._id === user?.id);
      setRank(me?.rank || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const baseXP = xpForNextLevel(currentLevel - 1) || 0;
  const progress = Math.min(100, Math.round(((currentXP - baseXP) / (nextLevelXP - baseXP)) * 100));

  const pendingTasks = tasks.filter(t => !submissions.some(s => (s.task?._id || s.task) === t._id));
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  return (
    <div className="min-h-screen bw-theme" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Welcome card */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>{user?.class} · {user?.school || 'EcoQuest'}</p>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono">{currentXP}</p>
                    <p className="text-[11px] flex items-center gap-1 justify-center mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <Star size={9} className="text-eco-400" />Total XP
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono text-orange-400">{user?.streak || 0}</p>
                    <p className="text-[11px] flex items-center gap-1 justify-center mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <Flame size={9} className="text-orange-400" />Streak
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono">{rank ? `#${rank}` : '—'}</p>
                    <p className="text-[11px] flex items-center gap-1 justify-center mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <Trophy size={9} />Rank
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-3)' }}>
                  <span className="flex items-center gap-1"><Zap size={10} className="text-eco-400" /> Level {currentLevel}</span>
                  <span className="font-mono">{currentXP - baseXP} / {nextLevelXP - baseXP} XP → Level {currentLevel + 1}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: '/learn', icon: BookOpen, label: 'Tests', sub: 'Learn & Test' },
                { to: '/civic', icon: Leaf, label: 'Tasks', sub: `${pendingTasks.length} available` },
                { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', sub: rank ? `Rank #${rank}` : 'View ranking' },
              ].map((a) => (
                <Link key={a.to} to={a.to}
                  className="rounded-2xl p-4 transition-colors group"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <a.icon size={18} className="text-eco-400 mb-2.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[13px] font-semibold">{a.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{a.sub}</p>
                </Link>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {/* Tasks column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Available tasks */}
                <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[13px] font-semibold">Available Tasks</h2>
                    <Link to="/civic" className="text-[12px] flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>
                  {loading ? (
                    <div className="space-y-2">{[1,2,3].map(i => (
                      <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--tile)' }} />
                    ))}</div>
                  ) : pendingTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
                      <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>All tasks completed!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 4).map((task) => (
                        <div key={task._id} className="flex items-center justify-between rounded-xl p-3"
                          style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <span className="text-base">{catIcon[task.category] || '📋'}</span>
                            <div>
                              <p className="text-[13px] font-medium">{task.title}</p>
                              <p className="text-[11px] capitalize" style={{ color: 'var(--text-3)' }}>{task.category} · {task.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono font-semibold text-eco-400">+{task.xpReward}</span>
                            <Link to="/civic" className="btn-primary text-[11px]" style={{ padding: '0.3rem 0.65rem' }}>Do it</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent submissions */}
                <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[13px] font-semibold">My Submissions</h2>
                    <Link to="/civic" className="text-[12px] flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                      View all <ArrowRight size={10} />
                    </Link>
                  </div>
                  {submissions.length === 0 ? (
                    <p className="text-[12px] text-center py-4" style={{ color: 'var(--text-3)' }}>No submissions yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {submissions.slice(0, 5).map((sub) => (
                        <div key={sub._id} className="flex items-center justify-between rounded-xl p-3"
                          style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          <div>
                            <p className="text-[13px] font-medium">{sub.task?.title || 'Task'}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{new Date(sub.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {sub.teacherScore != null && <span className="text-[11px] font-mono" style={{ color: 'var(--text-2)' }}>{sub.teacherScore}/10</span>}
                            {sub.xpAwarded > 0 && <span className="text-[11px] font-mono font-semibold text-eco-400">+{sub.xpAwarded}</span>}
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-2)' }}>
                              {statusIcon(sub.status)} {sub.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <h2 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Activity</h2>
                  <HeatMap activityLog={user?.activityLog || []} />
                </div>

                <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <h2 className="text-[12px] font-semibold" style={{ color: 'var(--text-2)' }}>Stats</h2>
                  {[
                    { label: 'Tasks Done', value: approvedCount, icon: CheckCircle },
                    { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length, icon: Clock },
                    { label: 'Streak', value: `${user?.streak || 0}d`, icon: Flame },
                    { label: 'Badges', value: (user?.badges?.length || 0), icon: Shield },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[12px] flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
                        <s.icon size={11} />{s.label}
                      </span>
                      <span className="text-[13px] font-bold font-mono">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
