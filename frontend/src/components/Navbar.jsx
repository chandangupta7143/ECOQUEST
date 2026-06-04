import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Flame, LayoutDashboard, CheckCircle, XCircle, Clock, Zap, UserCircle, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { fileUrl } from '../api/axios';

function NotifIcon({ type }) {
  if (type === 'submission_approved') return <CheckCircle size={12} className="shrink-0" style={{ color: '#3b82f6' }} />;
  if (type === 'submission_rejected') return <XCircle size={12} className="shrink-0" style={{ color: '#ff4757' }} />;
  return <Clock size={12} className="shrink-0" style={{ color: '#fbbf24' }} />;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try { const { data } = await api.get('/notifications'); setNotifications(data); } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openNotifs = async () => {
    setNotifOpen(v => !v);
    setDropdownOpen(false);
    if (!notifOpen && unread > 0) {
      try { await api.put('/notifications/read-all'); setNotifications(p => p.map(n => ({ ...n, read: true }))); } catch {}
    }
  };

  const dashPath = user?.role === 'teacher' ? '/teacher' : '/dashboard';
  const unread = notifications.filter(n => !n.read).length;
  const xpForNext = (user?.level || 1) * 500;
  const xpPct = Math.min(100, ((user?.xp || 0) % xpForNext) / xpForNext * 100);

  return (
    <nav
      className="main-nav sticky top-0 z-50 flex items-center px-4 md:px-6"
      style={{
        height: 'var(--nav-h)',
        boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.5)' : 'none',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="max-w-[1500px] w-full mx-auto flex items-center gap-3">

        {/* Logo */}
        <Link to={user ? dashPath : '/'} className="flex items-center gap-2.5 shrink-0 mr-4 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235,0.25) 0%, rgba(59, 130, 246,0.15) 100%)',
              border: '1px solid rgba(37, 99, 235,0.35)',
              boxShadow: '0 0 12px rgba(37, 99, 235,0.15)',
            }}
          >
            <Leaf size={15} style={{ color: '#3b82f6' }} />
          </div>
          <span
            className="font-display font-bold text-[16px] tracking-tight hidden sm:block"
            style={{ background: 'linear-gradient(135deg, #f0fff4 0%, rgba(240,255,244,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            EcoQuest
          </span>
        </Link>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">

            {/* Streak pill */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px]"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}
            >
              <Flame size={13} style={{ color: '#fbbf24' }} />
              <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{user.streak || 0}</span>
            </div>

            {/* Level + XP bar — students only */}
            {user?.role !== 'teacher' && (
              <div className="hidden lg:flex flex-col items-end gap-0.5 mr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>Lv.{user.level || 1}</span>
                  <Zap size={10} style={{ color: '#3b82f6' }} />
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>{user.xp || 0} XP</span>
                </div>
                <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${xpPct}%`,
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                      boxShadow: '0 0 6px rgba(59, 130, 246,0.6)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotifs}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: notifOpen ? 'rgba(59, 130, 246,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${notifOpen ? 'rgba(37, 99, 235,0.30)' : 'var(--border-w)'}`,
                }}
              >
                <Bell size={15} style={{ color: unread > 0 ? '#f0fff4' : 'var(--text-3)' }} />
                {unread > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 text-[9px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #ff4757, #ff6b7a)', boxShadow: '0 0 8px rgba(255,71,87,0.5)' }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 slide-down"
                  style={{
                    background: 'rgba(11,22,13,0.92)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border-md)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59, 130, 246,0.05)',
                  }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-[13px] font-semibold">Notifications</p>
                    {notifications.length > 0 && (
                      <span className="badge badge-gray">{notifications.length}</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell size={20} className="mx-auto mb-2.5" style={{ color: 'var(--text-4)' }} />
                        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: !n.read ? 'rgba(59, 130, 246,0.02)' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(59, 130, 246,0.02)' : 'transparent'}
                      >
                        <NotifIcon type={n.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{n.message}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: '#3b82f6', boxShadow: '0 0 4px rgba(59, 130, 246,0.8)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 h-9 px-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: dropdownOpen ? 'rgba(59, 130, 246,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${dropdownOpen ? 'rgba(37, 99, 235,0.30)' : 'var(--border-w)'}`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: user.avatar ? 'transparent' : 'linear-gradient(135deg, rgba(37, 99, 235,0.3), rgba(59, 130, 246,0.15))',
                    border: '1px solid rgba(37, 99, 235,0.25)',
                  }}
                >
                  {user.avatar
                    ? <img src={fileUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    : <span style={{ color: '#3b82f6' }}>{user.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span className="text-[13px] font-medium hidden sm:block">{user.name?.split(' ')[0]}</span>
                <ChevronDown
                  size={12}
                  style={{
                    color: 'var(--text-3)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50 slide-down"
                  style={{
                    background: 'rgba(11,22,13,0.92)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border-md)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-[13px] font-semibold">{user.name}</p>
                    <p className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-3)' }}>{user.role}</p>
                  </div>
                  <Link
                    to={dashPath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all duration-150"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    <LayoutDashboard size={13} /> Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all duration-150"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    <UserCircle size={13} /> View Profile
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all duration-150"
                    style={{ color: '#ff6b7a' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-[13px] py-1.5 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-[13px] py-1.5 px-4">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
