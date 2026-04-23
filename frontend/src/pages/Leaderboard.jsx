import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [scope, setScope] = useState('global');
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

  const myEntry = data.find(d => d._id === user?.id || d._id === user?._id);
  const top3 = data.slice(0, 3);

  return (
    <div className="min-h-screen bw-theme" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-5">
              <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>Compete. Improve. Lead.</p>
            </div>

            {/* Scope toggle */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {[{ v:'global', l:'🌍 Global' }, { v:'class', l:'🎓 My Class' }].map(s => (
                <button key={s.v} onClick={() => setScope(s.v)}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={scope === s.v
                    ? { background: 'var(--tile)', color: 'white', border: '1px solid var(--border-md)' }
                    : { color: 'var(--text-3)', border: '1px solid transparent' }
                  }>
                  {s.l}
                </button>
              ))}
            </div>

            {/* Podium */}
            {!loading && top3.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].map((entry, idx) => {
                  const isFirst = idx === 1;
                  const medals = ['🥈', '🥇', '🥉'];
                  const heights = [64, 96, 48];
                  return (
                    <div key={entry._id} className="flex flex-col items-center gap-1.5">
                      {isFirst && <Trophy size={18} className="text-eco-400 mb-0.5" />}
                      <div className="rounded-full flex items-center justify-center font-bold text-base"
                        style={{
                          width: isFirst ? 56 : 44,
                          height: isFirst ? 56 : 44,
                          background: 'var(--tile)',
                          border: `1px solid ${isFirst ? 'rgba(22,163,74,0.4)' : 'var(--border)'}`
                        }}>
                        {entry.name?.[0]}
                      </div>
                      <p className="text-[12px] font-medium text-center max-w-[60px] truncate">{entry.name?.split(' ')[0]}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>{entry.xp} XP</p>
                      <div className="w-14 rounded-t-xl flex items-center justify-center"
                        style={{ height: heights[idx], background: 'var(--tile)', border: '1px solid var(--border)', borderBottom: 'none' }}>
                        <span className="text-lg">{medals[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* My rank banner */}
            {myEntry && (
              <div className="rounded-xl p-3 mb-3 flex items-center gap-3 text-[13px]"
                style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.20)' }}>
                <Trophy size={13} className="text-eco-400" />
                <span>Your rank: <strong className="text-eco-400">#{myEntry.rank}</strong></span>
                <span style={{ color: 'var(--text-3)' }}>·</span>
                <span className="font-mono" style={{ color: 'var(--text-2)' }}>{myEntry.xp} XP</span>
              </div>
            )}

            {/* Full list */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {loading ? (
                <div className="p-4 space-y-2">{[...Array(8)].map((_,i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--tile)' }} />
                ))}</div>
              ) : data.length === 0 ? (
                <p className="text-center py-10 text-[13px]" style={{ color: 'var(--text-3)' }}>No students found</p>
              ) : (
                <div style={{ borderTop: 'none' }}>
                  {data.map((entry, i) => {
                    const isMe = entry._id === user?.id || entry._id === user?._id;
                    return (
                      <div key={entry._id}
                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isMe ? 'rgba(22,163,74,0.06)' : 'transparent'
                        }}>
                        <span className="text-[13px] font-bold w-7 text-center font-mono"
                          style={{ color: entry.rank <= 3 ? 'white' : 'var(--text-3)' }}>
                          {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
                        </span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          {entry.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate">
                            {entry.name} {isMe && <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>(you)</span>}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{entry.class} · Lv.{entry.level}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold font-mono flex items-center gap-1 justify-end">
                            <Star size={10} className="text-eco-400" />{entry.xp}
                          </p>
                          <p className="text-[10px] flex items-center gap-0.5 justify-end" style={{ color: 'var(--text-3)' }}>
                            <Flame size={9} className="text-orange-400" />{entry.streak}d
                          </p>
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
