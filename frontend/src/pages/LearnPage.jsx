import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, ChevronDown, FileText, Star, ArrowRight,
  ClipboardList, ExternalLink, Download, Check, Zap, Lock, Play,
  Layers, FlaskConical, Leaf, Globe, Atom, Calculator, Music, Palette
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api, { fileUrl } from '../api/axios';

const defaultConcepts = [
  'This chapter covers important environmental concepts.',
  'Understanding this topic helps build awareness about our natural world.',
  'Real-world applications of these concepts can create lasting change.',
  'Practice through civic tasks to reinforce your learning.',
];

const SUBJECT_ICONS = [Leaf, Globe, Atom, Calculator, FlaskConical, Music, Palette, Layers];
const SUBJECT_COLORS = [
  { bg: 'rgba(37, 99, 235,0.12)', border: 'rgba(37, 99, 235,0.30)', icon: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246,0.15)' },
  { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.30)', icon: '#00d4ff', glow: '0 0 20px rgba(0,212,255,0.15)' },
  { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.30)', icon: '#a855f7', glow: '0 0 20px rgba(168,85,247,0.15)' },
  { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.30)', icon: '#fbbf24', glow: '0 0 20px rgba(251,191,36,0.15)' },
  { bg: 'rgba(255,71,87,0.12)', border: 'rgba(255,71,87,0.30)', icon: '#ff4757', glow: '0 0 20px rgba(255,71,87,0.15)' },
  { bg: 'rgba(37, 99, 235,0.12)', border: 'rgba(37, 99, 235,0.30)', icon: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246,0.15)' },
  { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.30)', icon: '#00d4ff', glow: '0 0 20px rgba(0,212,255,0.15)' },
  { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.30)', icon: '#a855f7', glow: '0 0 20px rgba(168,85,247,0.15)' },
];

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#3b82f6', bg: 'rgba(59, 130, 246,0.10)',  border: 'rgba(59, 130, 246,0.25)'  },
  medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)' },
  hard:   { label: 'Hard',   color: '#ff4757', bg: 'rgba(255,71,87,0.10)',  border: 'rgba(255,71,87,0.25)'  },
};

function DifficultyBadge({ difficulty }) {
  const d = difficulty?.toLowerCase();
  const cfg = DIFFICULTY_CONFIG[d] || DIFFICULTY_CONFIG.easy;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function SubjectCard({ subject, index, isActive, onClick }) {
  const clr = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  const Icon = SUBJECT_ICONS[index % SUBJECT_ICONS.length];
  return (
    <button onClick={onClick}
      className="relative text-left rounded-2xl p-4 transition-all duration-300 hover-lift group overflow-hidden"
      style={{
        background: isActive ? clr.bg : 'var(--card)',
        border: `1px solid ${isActive ? clr.border : 'var(--border)'}`,
        boxShadow: isActive ? clr.glow : 'none',
      }}>
      {isActive && (
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(circle at 30% 30%, ${clr.icon}, transparent 70%)` }} />
      )}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all"
        style={{ background: clr.bg, border: `1px solid ${clr.border}` }}>
        <Icon size={18} style={{ color: clr.icon }} />
      </div>
      <p className="text-[13px] font-bold leading-snug mb-1">{subject.name}</p>
      <p className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>
        {subject.chapters?.length || 0} chapters
      </p>
      {isActive && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{ background: clr.icon, boxShadow: `0 0 8px ${clr.icon}` }} />
      )}
    </button>
  );
}

function ChapterAccordion({ chapter, index, isActive, onClick, quizzes, attempts, notes, onViewAllTests }) {
  const done_qs = quizzes.filter(q => attempts.some(a => (a.quiz?.id || a.quiz) === q.id));
  const chapterNotes = notes.filter(n => n.chapter?.toLowerCase() === chapter.name.toLowerCase());

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isActive ? 'var(--card)' : 'var(--tile)',
        border: `1px solid ${isActive ? 'var(--border-md)' : 'var(--border)'}`,
        boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
      }}>
      <button onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors group">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono w-6 shrink-0" style={{ color: 'var(--text-4)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[13px] font-semibold">{chapter.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {quizzes.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'rgba(59, 130, 246,0.10)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246,0.20)' }}>
              {quizzes.length} test{quizzes.length !== 1 ? 's' : ''}
            </span>
          )}
          <div className="transition-transform duration-300" style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown size={15} style={{ color: 'var(--text-3)' }} />
          </div>
        </div>
      </button>

      {isActive && (
        <div className="px-4 pb-4 space-y-4 fade-in-up">
          {/* Key concepts */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>Key Concepts</p>
            <ul className="space-y-2">
              {defaultConcepts.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'var(--text-2)' }}>
                  <span className="shrink-0 mt-0.5 text-[9px] font-bold" style={{ color: '#3b82f6' }}>▶</span> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Eco action tip */}
          <div className="rounded-xl p-3 flex items-start gap-2.5"
            style={{ background: 'rgba(59, 130, 246,0.05)', border: '1px solid rgba(59, 130, 246,0.15)' }}>
            <Globe size={13} className="shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
              This topic connects to real eco-actions in the Civic Hub. Complete tasks to earn bonus XP.
            </p>
          </div>

          {/* Notes */}
          {chapterNotes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>Study Materials</p>
              <div className="space-y-2">
                {chapterNotes.map(note => {
                  const href = note.fileUrl ? fileUrl(note.fileUrl) : note.externalUrl || '#';
                  if (note.type === 'image' && note.fileUrl) {
                    return (
                      <div key={note.id} className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                        <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-base">🖼️</span>
                            <span className="text-[13px] font-medium">{note.title}</span>
                          </div>
                          <a href={href} download={note.fileOriginalName || true}
                            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--text-3)' }}>
                            <Download size={13} />
                          </a>
                        </div>
                        <img src={href} alt={note.title} className="w-full h-auto object-contain max-h-[60vh]" />
                      </div>
                    );
                  }
                  const typeEmoji = note.type === 'pdf' ? '📄' : note.type === 'video' ? '🎥' : note.type === 'image' ? '🖼️' : '🔗';
                  const typeLabel = note.type === 'pdf' ? (note.fileOriginalName || 'PDF Document') : note.type === 'image' ? 'Image' : note.type === 'video' ? 'Video' : 'External Link';
                  return (
                    <a key={note.id} href={href} target="_blank" rel="noopener noreferrer"
                      download={(note.type === 'pdf' || note.type === 'image') ? (note.fileOriginalName || true) : undefined}
                      className="flex items-center justify-between rounded-xl p-3 transition-all hover-lift group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                          style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          {typeEmoji}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{note.title}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{typeLabel}</p>
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg transition-colors group-hover:bg-white/10" style={{ color: 'var(--text-3)' }}>
                        {note.type === 'pdf' || note.type === 'image' ? <Download size={13} /> : <ExternalLink size={13} />}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chapter quizzes */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-3)' }}>Tests</p>
            {quizzes.length === 0 ? (
              <p className="text-[12px] text-center py-3" style={{ color: 'var(--text-3)' }}>
                No tests yet ·{' '}
                <button onClick={onViewAllTests} className="underline" style={{ color: '#3b82f6' }}>View all tests</button>
              </p>
            ) : (
              <div className="space-y-2">
                {quizzes.map(q => {
                  const done = attempts.some(a => (a.quiz?.id || a.quiz) === q.id);
                  const score = attempts.find(a => (a.quiz?.id || a.quiz) === q.id)?.score;
                  return (
                    <Link key={q.id} to={done ? '#' : `/quiz/${q.id}`}
                      className="flex items-center justify-between rounded-xl p-3 transition-all group"
                      style={{
                        background: done ? 'rgba(59, 130, 246,0.04)' : 'var(--tile)',
                        border: `1px solid ${done ? 'rgba(59, 130, 246,0.15)' : 'var(--border)'}`,
                        opacity: done ? 0.8 : 1,
                        cursor: done ? 'default' : 'pointer',
                      }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: done ? 'rgba(59, 130, 246,0.10)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                          {done ? <Check size={12} style={{ color: '#3b82f6' }} /> : <Play size={10} style={{ color: 'var(--text-3)' }} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{q.title}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {q.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={q.difficulty} />
                        {done
                          ? <span className="text-[11px] font-mono font-bold" style={{ color: '#3b82f6' }}>{score}%</span>
                          : <span className="text-[10px] font-mono flex items-center gap-0.5" style={{ color: '#3b82f6' }}>
                              <Star size={9} /><span>+{q.xpReward}</span>
                            </span>
                        }
                        {!done && <ArrowRight size={12} style={{ color: 'var(--text-3)' }} className="group-hover:translate-x-0.5 transition-transform" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const { user } = useAuth();
  const [view, setView] = useState('tests');
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const cls = encodeURIComponent(user.class || '');
    Promise.all([
      api.get(`/quizzes?class=${cls}`),
      api.get('/quizzes/attempts'),
      api.get(`/notes?class=${cls}`),
      api.get(`/subjects?class=${cls}`),
    ])
      .then(([qr, ar, nr, sr]) => {
        setQuizzes(qr.data);
        setAttempts(ar.data);
        setNotes(nr.data);
        setSubjects(sr.data);
        if (sr.data.length) setActiveSubjectId(sr.data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const activeSubject = subjects.find(s => s.id === activeSubjectId);
  const chapterQuizzes = (chapterId) => {
    const chapter = activeSubject?.chapters.find(c => c.id === chapterId);
    return activeSubject && chapter
      ? quizzes.filter(q => q.subject === activeSubject.name && q.chapter?.toLowerCase() === chapter.name.toLowerCase())
      : [];
  };
  const chapterNotes = (chapterId) => {
    const chapter = activeSubject?.chapters.find(c => c.id === chapterId);
    return activeSubject && chapter
      ? notes.filter(n => n.subject === activeSubject.name && n.chapter?.toLowerCase() === chapter.name.toLowerCase())
      : [];
  };

  const completedCount = attempts.length;
  const totalTests = quizzes.length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 p-4 md:p-6 pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-6 fade-in-up">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Learning Hub</h1>
                  <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                    Teacher-curated content for <span style={{ color: '#3b82f6' }}>{user?.class}</span>
                  </p>
                </div>
                {!loading && (
                  <div className="flex items-center gap-1.5 text-[12px] font-mono px-3 py-1.5 rounded-xl"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                    <Zap size={12} style={{ color: '#3b82f6' }} />
                    <span style={{ color: '#3b82f6' }}>{completedCount}</span>/{totalTests} done
                  </div>
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {[
                { id: 'tests', label: `All Tests (${quizzes.length})`, icon: ClipboardList },
                { id: 'learn', label: 'Learn by Chapter', icon: BookOpen },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setView(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200"
                  style={view === id
                    ? { background: '#2563eb', color: '#000', boxShadow: '0 0 16px rgba(37, 99, 235,0.35)' }
                    : { color: 'var(--text-3)' }}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>

            {/* ── ALL TESTS VIEW ── */}
            {view === 'tests' && (
              <div className="fade-in-up">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-20 rounded-2xl skeleton" />
                    ))}
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="rounded-2xl p-16 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                      <FileText size={28} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <p className="text-[15px] font-semibold mb-1">No tests yet</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Your teacher will add tests here soon</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map((q, idx) => {
                      const done = attempts.some(a => (a.quiz?.id || a.quiz) === q.id);
                      const score = attempts.find(a => (a.quiz?.id || a.quiz) === q.id)?.score;
                      return (
                        <Link key={q.id} to={done ? '#' : `/quiz/${q.id}`}
                          className="flex items-center justify-between rounded-2xl p-4 transition-all duration-200 group hover-lift"
                          style={{
                            background: 'var(--card)',
                            border: `1px solid ${done ? 'rgba(59, 130, 246,0.15)' : 'var(--border)'}`,
                            opacity: done ? 0.75 : 1,
                            cursor: done ? 'default' : 'pointer',
                            animationDelay: `${idx * 50}ms`,
                          }}>
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                              style={{
                                background: done ? 'rgba(59, 130, 246,0.08)' : 'var(--tile)',
                                border: `1px solid ${done ? 'rgba(59, 130, 246,0.20)' : 'var(--border)'}`,
                              }}>
                              {done
                                ? <Check size={17} style={{ color: '#3b82f6' }} />
                                : <FileText size={17} style={{ color: 'var(--text-3)' }} />
                              }
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold flex items-center gap-2.5">
                                {q.title}
                                {done && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                                    style={{ background: 'rgba(59, 130, 246,0.10)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246,0.20)' }}>
                                    Completed
                                  </span>
                                )}
                              </p>
                              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                                {q.subject} · {q.chapter} · {q.class} · {q.questions?.length || 0} questions
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <DifficultyBadge difficulty={q.difficulty} />
                            {done ? (
                              <div className="text-right">
                                <p className="text-[15px] font-bold font-mono" style={{ color: '#3b82f6' }}>{score}%</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Score</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] flex items-center gap-1 font-mono font-bold" style={{ color: '#3b82f6' }}>
                                  <Star size={11} />+{q.xpReward} XP
                                </span>
                                <div className="btn-primary text-[12px] flex items-center gap-1.5"
                                  style={{ padding: '0.35rem 0.9rem' }}>
                                  Start <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── LEARN BY CHAPTER VIEW ── */}
            {view === 'learn' && (
              subjects.length === 0 ? (
                <div className="rounded-2xl p-16 text-center fade-in-up"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                    <BookOpen size={28} style={{ color: 'var(--text-3)' }} />
                  </div>
                  <p className="text-[15px] font-semibold mb-1">Curriculum not set up yet</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Your teacher hasn't added subjects yet</p>
                </div>
              ) : (
                <div className="fade-in-up">
                  {/* Subject bento grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {subjects.map((s, i) => (
                      <SubjectCard key={s.id} subject={s} index={i}
                        isActive={activeSubjectId === s.id}
                        onClick={() => { setActiveSubjectId(s.id); setActiveChapterId(null); }} />
                    ))}
                  </div>

                  {/* Chapter accordion */}
                  {activeSubject && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[15px] font-bold">{activeSubject.name}</h2>
                        <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                          {activeSubject.chapters?.length || 0} chapters
                        </span>
                      </div>
                      {activeSubject.chapters?.length === 0 ? (
                        <div className="rounded-2xl p-10 text-center"
                          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No chapters added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeSubject.chapters.map((ch, i) => (
                            <ChapterAccordion
                              key={ch.id}
                              chapter={ch}
                              index={i}
                              isActive={activeChapterId === ch.id}
                              onClick={() => setActiveChapterId(activeChapterId === ch.id ? null : ch.id)}
                              quizzes={chapterQuizzes(ch.id)}
                              attempts={attempts}
                              notes={chapterNotes(ch.id)}
                              onViewAllTests={() => setView('tests')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
