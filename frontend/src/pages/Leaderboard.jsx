import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Zap, Globe, GraduationCap, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ─── Skeleton row ─── */
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
    <div className="skeleton w-7 h-4 rounded" />
    <div className="skeleton w-9 h-9 rounded-full" />
    <div className="flex-1 space-y-1.5">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton h-2.5 w-20 rounded" />
    </div>
    <div className="space-y-1.5 text-right">
      <div className="skeleton h-3 w-14 rounded" />
      <div className="skeleton h-2.5 w-10 rounded ml-auto" />
    </div>
  </div>
);

/* ─── Podium block ─── */
const PodiumBlock = ({ entry, position, isFirst }) => {
  const heights   = { 0: 72, 1: 104, 2: 52 }; // 2nd | 1st | 3rd
  const sizes     = { 0: 44, 1: 60,  2: 38  };
  const medals    = { 0: '🥈', 1: '🥇', 2: '🥉' };
  const baseColors = {
    0: 'rgba(148,163,184,0.12)',
    1: 'rgba(251,191,36,0.12)',
    2: 'rgba(180,120,60,0.10)',
  };
  const baseBorders = {
    0: 'rgba(148,163,184,0.25)',
    1: 'rgba(251,191,36,0.30)',
    2: 'rgba(180,120,60,0.22)',
  };
  const avatarBorders = {
    0: 'rgba(148,163,184,0.40)',
    1: 'rgba(251,191,36,0.70)',
    2: 'rgba(180,120,60,0.45)',
  };

  return (
    <div className="flex flex-col items-center gap-1.5 fade-in-up" style={{ animationDelay: `${position * 80}ms` }}>
      {/* Medal / trophy above */}
      {isFirst ? (
        <div className="flex flex-col items-center gap-0.5 mb-1">
          <Trophy size={20} style={{ color: 'var(--amber)', filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' }} />
        </div>
      ) : (
        <span className="text-xl mb-1">{medals[position]}</span>
      )}

      {/* Avatar */}
      <div
        className="rounded-full flex items-center justify-center font-bold shrink-0 transition-transform hover:scale-110"
        style={{
          width:  sizes[position],
          height: sizes[position],
          fontSize: isFirst ? 22 : 16,
          background: isFirst
            ? 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.06))'
            : 'var(--tile)',
          border: `2px solid ${avatarBorders[position]}`,
          boxShadow: isFirst ? '0 0 16px rgba(251,191,36,0.25)' : 'none',
        }}
      >
        {entry.name?.[0]?.toUpperCase()}
      </div>

      {/* Name + XP */}
      <p className="text-[12px] font-semibold text-center max-w-[70px] truncate mt-0.5">{entry.name?.split(' ')[0]}</p>
      <p className="mono text-[10px]" style={{ color: isFirst ? 'var(--amber)' : 'var(--text-3)' }}>
        {entry.xp?.toLocaleString()} XP
      </p>

      {/* Podium base */}
      <div
        className="w-16 rounded-t-xl flex items-end justify-center pb-2"
        style={{
          height: heights[position],
          background: baseColors[position],
          border: `1px solid ${baseBorders[position]}`,
          borderBottom: 'none',
        }}
      >
        <span className="text-2xl">{medals[position]}</span>
      </div>
    </div>
  );
};

/* ─── Main component ─── */
export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData]     = useState([]);
  const [scope, setScope]   = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = (scope === 'class' && user?.class)
      ? `?scope=class&class=${encodeURIComponent(user.class)}`
      : '?scope=global';
    api.get(`/leaderboard${params}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scope, user?.class]);

  const myEntry = data.find(d => d.id === user?.id);
  const top3    = data.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-4 md:p-8 pb-24 md:pb-8">

          {/* ── Ambient glow ── */}
          <div
            aria-hidden
            className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(37, 99, 235,0.25) 0%, transparent 70%)', zIndex: 0 }}
          />

          <div className="max-w-2xl mx-auto relative" style={{ zIndex: 1 }}>

            {/* ── Page Header ── */}
            <div className="mb-8 fade-in-up">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235,0.20), rgba(37, 99, 235,0.06))',
                    border: '1px solid rgba(37, 99, 235,0.30)',
                    boxShadow: '0 0 16px rgba(37, 99, 235,0.15)',
                  }}
                >
                  <Trophy size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                    Leaderboard
                  </h1>
                  <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                    Compete · Improve · Lead the planet
                  </p>
                </div>
              </div>
            </div>

            {/* ── Scope Toggle ── */}
            <div
              className="glass flex gap-1 mb-8 p-1 rounded-2xl fade-in-up"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                animationDelay: '60ms',
              }}
            >
              {[
                { v: 'global', l: 'Global', icon: Globe },
                { v: 'class',  l: 'My Class', icon: GraduationCap },
              ].map(s => {
                const Icon = s.icon;
                const active = scope === s.v;
                return (
                  <button
                    key={s.v}
                    onClick={() => setScope(s.v)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, rgba(37, 99, 235,0.22), rgba(59, 130, 246,0.10))',
                            color: 'var(--accent-b)',
                            border: '1px solid rgba(37, 99, 235,0.35)',
                            boxShadow: '0 0 14px rgba(37, 99, 235,0.18)',
                          }
                        : {
                            color: 'var(--text-3)',
                            border: '1px solid transparent',
                          }
                    }
                  >
                    <Icon size={14} />
                    {s.l}
                  </button>
                );
              })}
            </div>

            {/* ── Podium ── */}
            {!loading && top3.length >= 3 && (
              <div className="mb-10">
                <div className="flex items-end justify-center gap-5">
                  <PodiumBlock entry={top3[1]} position={0} isFirst={false} />
                  <PodiumBlock entry={top3[0]} position={1} isFirst={true}  />
                  <PodiumBlock entry={top3[2]} position={2} isFirst={false} />
                </div>
                {/* Podium stage line */}
                <div
                  className="h-px mt-0 rounded-full mx-8"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235,0.25), transparent)' }}
                />
              </div>
            )}

            {/* ── My Rank Banner ── */}
            {myEntry && (
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4 fade-in-up"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235,0.10), rgba(59, 130, 246,0.04))',
                  border: '1px solid rgba(37, 99, 235,0.28)',
                  boxShadow: '0 0 20px rgba(37, 99, 235,0.08)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(37, 99, 235,0.15)', border: '1px solid rgba(37, 99, 235,0.3)' }}
                >
                  <Crown size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 flex items-center gap-3 text-[13px] flex-wrap">
                  <span style={{ color: 'var(--text-2)' }}>Your rank:</span>
                  <span className="mono font-bold text-[15px]" style={{ color: 'var(--accent-b)' }}>
                    #{myEntry.rank}
                  </span>
                  <span style={{ color: 'var(--border-hi)' }}>·</span>
                  <span className="mono" style={{ color: 'var(--text-2)' }}>{myEntry.xp?.toLocaleString()} XP</span>
                  {myEntry.streak > 0 && (
                    <>
                      <span style={{ color: 'var(--border-hi)' }}>·</span>
                      <span className="flex items-center gap-1 mono" style={{ color: 'var(--amber)' }}>
                        <Flame size={12} /> {myEntry.streak}d streak
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Full List ── */}
            <div
              className="card-glow rounded-2xl overflow-hidden fade-in-up"
              style={{ animationDelay: '120ms' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                    {scope === 'global' ? 'Global Rankings' : 'Class Rankings'}
                  </span>
                </div>
                <span
                  className="mono text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(37, 99, 235,0.10)', color: 'var(--accent)', border: '1px solid rgba(37, 99, 235,0.20)' }}
                >
                  {data.length} players
                </span>
              </div>

              {/* Rows */}
              {loading ? (
                <div>
                  {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <Trophy size={32} style={{ color: 'var(--text-4)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No students found in this scope.</p>
                </div>
              ) : (
                <div>
                  {data.map((entry, i) => {
                    const isMe = entry.id === user?.id;
                    const medalEmoji = ['🥇', '🥈', '🥉'];

                    return (
                      <div
                        key={entry.id}
                        className="group flex items-center gap-3 px-5 py-3.5 transition-all duration-150 cursor-default"
                        style={{
                          borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isMe
                            ? 'linear-gradient(90deg, rgba(37, 99, 235,0.08), rgba(37, 99, 235,0.03))'
                            : 'transparent',
                          boxShadow: isMe ? 'inset 3px 0 0 rgba(37, 99, 235,0.5)' : 'none',
                        }}
                        onMouseEnter={e => {
                          if (!isMe) e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isMe
                            ? 'linear-gradient(90deg, rgba(37, 99, 235,0.08), rgba(37, 99, 235,0.03))'
                            : 'transparent';
                        }}
                      >
                        {/* Rank */}
                        <span
                          className="w-8 text-center shrink-0"
                          style={{ fontSize: entry.rank <= 3 ? 17 : 12 }}
                        >
                          {entry.rank <= 3
                            ? medalEmoji[entry.rank - 1]
                            : <span className="mono font-bold" style={{ color: 'var(--text-3)' }}>#{entry.rank}</span>
                          }
                        </span>

                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                          style={{
                            background: isMe
                              ? 'linear-gradient(135deg, rgba(37, 99, 235,0.25), rgba(37, 99, 235,0.08))'
                              : 'var(--tile)',
                            border: `1.5px solid ${isMe ? 'rgba(37, 99, 235,0.45)' : 'var(--border)'}`,
                            color: isMe ? 'var(--accent-b)' : 'var(--text)',
                          }}
                        >
                          {entry.name?.[0]?.toUpperCase()}
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                            {entry.name}
                            {isMe && (
                              <span
                                className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                style={{
                                  background: 'rgba(37, 99, 235,0.15)',
                                  color: 'var(--accent)',
                                  border: '1px solid rgba(37, 99, 235,0.25)',
                                }}
                              >
                                you
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {entry.class} · Lv.{entry.level}
                          </p>
                        </div>

                        {/* XP + Streak */}
                        <div className="text-right shrink-0 space-y-0.5">
                          <p className="mono text-[13px] font-bold flex items-center gap-1 justify-end" style={{ color: 'var(--accent-b)' }}>
                            <Star size={10} />
                            {entry.xp?.toLocaleString()}
                          </p>
                          {entry.streak > 0 && (
                            <p className="mono text-[10px] flex items-center gap-0.5 justify-end" style={{ color: 'var(--amber)' }}>
                              <Flame size={9} /> {entry.streak}d
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
