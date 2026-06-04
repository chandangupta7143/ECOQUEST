import { NavLink } from 'react-router-dom';
import { fileUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Leaf, Trophy, BarChart2, Inbox, Star, Flame, Zap, ChevronRight } from 'lucide-react';

const studentLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   color: '#3b82f6' },
  { to: '/learn',       icon: BookOpen,         label: 'Learn',        color: '#00d4ff' },
  { to: '/civic',       icon: Leaf,             label: 'Civic',        color: '#a855f7' },
  { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard',  color: '#fbbf24' },
  { to: '/analytics',   icon: BarChart2,        label: 'Analytics',    color: '#ff4757' },
];

const teacherLinks = [
  { to: '/teacher',     icon: LayoutDashboard, label: 'Dashboard',   color: '#3b82f6' },
  { to: '/civic',       icon: Inbox,            label: 'Reviews',      color: '#00d4ff' },
  { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard',  color: '#fbbf24' },
  { to: '/analytics',   icon: BarChart2,        label: 'Analytics',    color: '#ff4757' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="main-sidebar hidden md:fixed md:flex md:left-0 md:top-0 md:h-screen md:w-[220px] flex-col z-40"
        style={{ paddingTop: 'var(--nav-h)', borderRight: '1px solid var(--border)' }}
      >
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/teacher'}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={({ isActive }) => ({
                color: isActive ? color : 'var(--text-3)',
                background: isActive ? `${color}10` : 'transparent',
                border: isActive ? `1px solid ${color}22` : '1px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Active glow bg */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{ background: `radial-gradient(ellipse at left, ${color}30, transparent 70%)` }}
                    />
                  )}

                  <Icon
                    size={16}
                    className="shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110"
                    style={{ color: isActive ? color : undefined }}
                  />
                  <span className="text-[13.5px] font-medium relative z-10 flex-1">{label}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full relative z-10"
                      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                    />
                  )}
                  {!isActive && (
                    <ChevronRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10"
                      style={{ color: 'var(--text-3)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4">
          <div
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235,0.06) 0%, rgba(59, 130, 246,0.03) 100%)',
              border: '1px solid rgba(37, 99, 235,0.15)',
            }}
          >
            {/* ambient glow */}
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(59, 130, 246,0.08) 0%, transparent 70%)' }} />

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-[12px] font-bold shrink-0"
                style={{
                  background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, rgba(37, 99, 235,0.25), rgba(59, 130, 246,0.15))',
                  border: '1px solid rgba(37, 99, 235,0.30)',
                  boxShadow: '0 0 12px rgba(37, 99, 235,0.15)',
                }}
              >
                {user?.avatar ? (
                  <img src={fileUrl(user.avatar)} alt={user?.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <span style={{ color: '#3b82f6' }}>{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate leading-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-3)' }}>{user?.class || user?.role}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex justify-between" style={{ color: 'var(--text-3)' }}>
              <span className="flex items-center gap-1 text-[11px]">
                <Star size={10} style={{ color: '#3b82f6' }} />
                <span className="font-mono text-[11px]">{user?.xp || 0}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Flame size={10} style={{ color: '#fbbf24' }} />
                <span className="font-mono text-[11px]">{user?.streak || 0}d</span>
              </span>
              {user?.role !== 'teacher' && (
                <span className="flex items-center gap-1 text-[11px]">
                  <Zap size={10} style={{ color: '#3b82f6' }} />
                  <span className="font-mono text-[11px]">Lv{user?.level || 1}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: 'rgba(7,16,10,0.92)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {links.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/teacher'}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors relative"
            style={({ isActive }) => ({ color: isActive ? color : 'rgba(255,255,255,0.25)' })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  />
                )}
                <Icon size={19} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
