import { useState, useEffect, useRef } from 'react';
import {
  Upload, CheckCircle, Clock, XCircle, Leaf, Droplets, Zap,
  Recycle, Sparkles, TreePine, X, Check, ChevronDown, ChevronUp,
  FileText, Star, Filter, AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api, { fileUrl } from '../api/axios';

/* ─── constants ─────────────────────────────────────────────────────────────── */
const catIcon  = { waste: Recycle, water: Droplets, energy: Zap, cleanliness: Sparkles, plantation: TreePine };
const catEmoji = { waste: '♻️', water: '💧', energy: '⚡', cleanliness: '🧹', plantation: '🌱', all: '🌍' };
const catColor = {
  waste:       { glow: 'rgba(251,191,36,0.18)',  border: 'rgba(251,191,36,0.30)',  text: '#fbbf24' },
  water:       { glow: 'rgba(0,212,255,0.15)',   border: 'rgba(0,212,255,0.28)',   text: '#00d4ff' },
  energy:      { glow: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
  cleanliness: { glow: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.28)', text: '#a855f7' },
  plantation:  { glow: 'rgba(37, 99, 235,0.15)',   border: 'rgba(37, 99, 235,0.28)',  text: '#2563eb' },
};
const typeBadgeClass = { quiz: 'badge-cyan', task: 'badge-green', civic: 'badge-purple', daily: 'badge-yellow', weekly: 'badge-red', mission: 'badge-purple' };

/* ─── helpers ───────────────────────────────────────────────────────────────── */
const statusBadge = (s) => {
  if (s === 'approved') return <span className="badge badge-green flex items-center gap-1"><CheckCircle size={9}/> Approved</span>;
  if (s === 'rejected') return <span className="badge badge-red flex items-center gap-1"><XCircle size={9}/> Rejected</span>;
  return <span className="badge badge-yellow flex items-center gap-1"><Clock size={9}/> Pending</span>;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   TEACHER VIEW
═══════════════════════════════════════════════════════════════════════════════ */
function TeacherView() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter]           = useState('all');
  const [expanded, setExpanded]       = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get('/submissions')
      .then(r => setSubmissions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async (status) => {
    if (!reviewModal) return;
    try {
      const { data } = await api.put(`/submissions/${reviewModal.sub.id}/review`, {
        teacherScore: reviewModal.score,
        status,
      });
      setSubmissions(subs => subs.map(s => s.id === reviewModal.sub.id ? { ...s, ...data, status } : s));
      setReviewModal(null);
    } catch {}
  };

  const filtered   = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
  const pendingCnt = submissions.filter(s => s.status === 'pending').length;

  const filterCfg = [
    { key: 'all',      label: 'All' },
    { key: 'pending',  label: `Pending${pendingCnt > 0 ? ` (${pendingCnt})` : ''}` },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.25)' }}>
            <FileText size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Submissions</h1>
            <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Review student task submissions and award XP</p>
          </div>
        </div>
      </div>

      {/* ── Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterCfg.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200"
            style={filter === key
              ? { background: 'var(--accent)', color: '#000', boxShadow: '0 0 14px rgba(37, 99, 235,0.45)' }
              : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* ── Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-14 text-center fade-in-up"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(37, 99, 235,0.08)', border: '1px solid rgba(37, 99, 235,0.15)' }}>
            <CheckCircle size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="font-semibold mb-1">All caught up!</p>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
            No submissions{filter !== 'all' ? ` with status "${filter}"` : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <div key={sub.id} className="rounded-2xl overflow-hidden transition-all hover-lift"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

              {/* Row */}
              <div className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 uppercase"
                    style={{ background: 'linear-gradient(135deg,rgba(37, 99, 235,0.25),rgba(37, 99, 235,0.08))', border: '1px solid rgba(37, 99, 235,0.25)', color: 'var(--accent)' }}>
                    {sub.student?.name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] truncate">{sub.student?.name}</p>
                    <p className="text-[12px] truncate" style={{ color: 'var(--text-3)' }}>
                      {sub.task?.title} · {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(sub.status)}
                  {sub.teacherScore != null && (
                    <span className="mono text-[12px] px-2 py-0.5 rounded-lg"
                      style={{ background: 'var(--tile)', color: 'var(--text-2)' }}>
                      {sub.teacherScore}/10
                    </span>
                  )}
                  {sub.status === 'pending' && (
                    <button onClick={() => setReviewModal({ sub, score: 7 })}
                      className="btn-primary text-[11px]" style={{ padding: '0.3rem 0.8rem' }}>
                      Review
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'var(--tile)', color: 'var(--text-3)' }}>
                    {expanded === sub.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {expanded === sub.id && (
                <div className="px-4 pb-5 pt-4 fade-in-up" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sub.imageUrl && (
                      <div className="w-full h-44 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
                        <img src={fileUrl(sub.imageUrl)} alt="proof" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                        style={{ color: 'var(--text-3)' }}>Student's Notes</p>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{sub.description}</p>
                      {sub.xpAwarded > 0 && (
                        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[12px] font-bold mono"
                          style={{ background: 'rgba(37, 99, 235,0.12)', color: 'var(--accent)', border: '1px solid rgba(37, 99, 235,0.25)' }}>
                          <Star size={11} /> +{sub.xpAwarded} XP awarded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ Review Modal ═══════════════════════════════════════════════════════ */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}>
          <div className="glass rounded-2xl w-full max-w-md p-6 fade-in-up"
            style={{ border: '1px solid var(--border-md)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-lg">Review Submission</h2>
                <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>Score and approve or reject</p>
              </div>
              <button onClick={() => setReviewModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--tile)', color: 'var(--text-3)' }}>
                <X size={14} />
              </button>
            </div>

            {/* Submission detail */}
            <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-[13px]">{reviewModal.sub.student?.name}</span>
                <span style={{ color: 'var(--text-4)' }}>·</span>
                <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{reviewModal.sub.task?.title}</span>
              </div>
              {reviewModal.sub.imageUrl && (
                <div className="w-full h-48 rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
                  <img src={fileUrl(reviewModal.sub.imageUrl)} alt="proof" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{reviewModal.sub.description}</p>
            </div>

            {/* Score slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="label">Score</label>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xl" style={{ color: 'var(--accent)' }}>
                    {reviewModal.score}
                  </span>
                  <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>/10</span>
                  <span className="mono text-[12px] ml-2" style={{ color: 'var(--accent)' }}>
                    → +{Math.round((reviewModal.score / 10) * (reviewModal.sub.task?.xpReward || 50))} XP
                  </span>
                </div>
              </div>
              <input type="range" min="1" max="10" className="w-full"
                style={{ accentColor: 'var(--accent)' }}
                value={reviewModal.score}
                onChange={e => setReviewModal({ ...reviewModal, score: +e.target.value })} />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
                <span>1 — Poor</span><span>5 — Average</span><span>10 — Excellent</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={() => submitReview('rejected')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={{ border: '1px solid rgba(255,71,87,0.30)', color: '#ff4757', background: 'rgba(255,71,87,0.06)' }}>
                <X size={13} /> Reject
              </button>
              <button onClick={() => submitReview('approved')}
                className="btn-primary flex-1 justify-center">
                <Check size={13} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STUDENT VIEW
═══════════════════════════════════════════════════════════════════════════════ */
function StudentView() {
  const [tasks, setTasks]           = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter]         = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm]             = useState({ description: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState('');
  const [submitError, setSubmitError] = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/submissions')])
      .then(([t, s]) => { setTasks(t.data); setSubmissions(s.data); })
      .catch(() => {});
  }, []);

  const CATEGORY_FILTERS = [
    { key: 'all',         label: 'All',         emoji: '🌍' },
    { key: 'waste',       label: 'Waste',        emoji: '♻️' },
    { key: 'water',       label: 'Water',        emoji: '💧' },
    { key: 'energy',      label: 'Energy',       emoji: '⚡' },
    { key: 'plantation',  label: 'Plantation',   emoji: '🌱' },
    { key: 'cleanliness', label: 'Cleanliness',  emoji: '🧹' },
    { key: 'daily',       label: 'Daily',        emoji: '📅' },
    { key: 'weekly',      label: 'Weekly',       emoji: '📆' },
    { key: 'mission',     label: 'Mission',      emoji: '🎯' },
  ];

  const filtered    = filter === 'all' ? tasks : tasks.filter(t => t.category === filter || t.type === filter);
  const isSubmitted = (id) => submissions.some(s => (s.task?.id || s.task) === id);
  const getSubStatus = (id) => {
    const sub = submissions.find(s => (s.task?.id || s.task) === id);
    return sub?.status || null;
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!selectedTask || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('taskId', selectedTask.id);
      fd.append('description', form.description);
      if (form.image) fd.append('image', form.image);
      const { data } = await api.post('/submissions', fd);
      setSubmissions([data, ...submissions]);
      setSelectedTask(null);
      setForm({ description: '', image: null });
      setSubmitError('');
      setSuccess('🎉 Submitted! Your teacher will review it soon.');
      setTimeout(() => setSuccess(''), 4500);
    } catch {
      setSubmitError('Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setSubmitError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File must be under 10 MB');
      return;
    }
    setSubmitError('');
    setForm(f => ({ ...f, image: file }));
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235,0.10) 0%, rgba(0,212,255,0.05) 50%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(37, 99, 235,0.18)',
        }}>
        {/* ambient glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37, 99, 235,0.18) 0%, transparent 70%)' }} />

        <div className="flex items-center gap-3 relative">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(37, 99, 235,0.15)', border: '1px solid rgba(37, 99, 235,0.30)' }}>
            <Leaf size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Civic Hub</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Complete real-world eco tasks · Upload proof · Earn XP
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(37, 99, 235,0.10)', border: '1px solid rgba(37, 99, 235,0.20)' }}>
            <span className="mono font-bold text-lg" style={{ color: 'var(--accent)' }}>{tasks.length}</span>
            <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>tasks available</span>
          </div>
        </div>
      </div>

      {/* ── Success toast ───────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-2.5 text-[13px] px-4 py-3 rounded-xl mb-5 fade-in-up"
          style={{ background: 'rgba(37, 99, 235,0.10)', border: '1px solid rgba(37, 99, 235,0.25)', color: 'var(--accent)' }}>
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* ── Category filter pills ───────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {CATEGORY_FILTERS.map(({ key, label, emoji }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
            style={filter === key
              ? { background: 'var(--accent)', color: '#000', boxShadow: '0 0 16px rgba(37, 99, 235,0.45)' }
              : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }
            }>
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      {/* ── Task bento grid ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filtered.map(task => {
          const Icon    = catIcon[task.category] || Leaf;
          const done    = isSubmitted(task.id);
          const status  = getSubStatus(task.id);
          const cat     = catColor[task.category] || { glow: 'rgba(37, 99, 235,0.10)', border: 'rgba(37, 99, 235,0.20)', text: 'var(--accent)' };
          const typeCls = typeBadgeClass[task.type] || 'badge-green';

          return (
            <div key={task.id}
              className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover-lift"
              style={{
                background: 'var(--card)',
                border: `1px solid ${done ? 'var(--border)' : cat.border}`,
                opacity: done ? 0.65 : 1,
                boxShadow: done ? 'none' : `0 0 0 1px transparent`,
              }}>

              {/* Top row: emoji icon + XP badge */}
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.glow, border: `1px solid ${cat.border}` }}>
                  {catEmoji[task.category] || '🌿'}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="mono text-[13px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(37, 99, 235,0.12)', color: 'var(--accent)', border: '1px solid rgba(37, 99, 235,0.22)' }}>
                    +{task.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Title + description */}
              <div className="flex-1">
                <h3 className="font-bold text-[15px] leading-snug mb-1.5">{task.title}</h3>
                <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-3)' }}>
                  {task.description}
                </p>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5">
                <span className={`badge ${typeCls} capitalize`}>{task.type}</span>
                {task.category && (
                  <span className="badge" style={{ background: cat.glow, color: cat.text, border: `1px solid ${cat.border}` }}>
                    {task.category}
                  </span>
                )}
                {task.deadline && (
                  <span className="badge badge-yellow flex items-center gap-1">
                    <Clock size={9} /> {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Action / status */}
              <div className="mt-auto pt-1">
                {done ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--accent)' }}>
                      <CheckCircle size={13} /> Submitted
                    </div>
                    {statusBadge(status)}
                  </div>
                ) : (
                  <button onClick={() => setSelectedTask(task)}
                    className="btn-primary w-full justify-center text-[13px]">
                    Submit Task →
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl p-14 text-center fade-in-up"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(37, 99, 235,0.08)', border: '1px solid rgba(37, 99, 235,0.15)' }}>
              <Leaf size={24} style={{ color: 'var(--text-3)' }} />
            </div>
            <p className="font-semibold mb-1">No tasks found</p>
            <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Try a different category filter</p>
          </div>
        )}
      </div>

      {/* ── My Submissions section ──────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display font-bold text-[15px]">My Submissions</h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>
              No submissions yet. Complete a task above! 🌱
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {submissions.map(sub => (
              <div key={sub.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                {sub.imageUrl && (
                  <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid var(--border)' }}>
                    <img src={fileUrl(sub.imageUrl)} alt="proof" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{sub.task?.title || 'Task'}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{sub.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.teacherScore != null && (
                    <span className="mono text-[11px] px-2 py-0.5 rounded-lg"
                      style={{ background: 'var(--tile)', color: 'var(--text-2)' }}>
                      {sub.teacherScore}/10
                    </span>
                  )}
                  {sub.xpAwarded > 0 && (
                    <span className="mono text-[11px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(37, 99, 235,0.12)', color: 'var(--accent)' }}>
                      +{sub.xpAwarded}
                    </span>
                  )}
                  {statusBadge(sub.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ Submit Modal ════════════════════════════════════════════════════════ */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}>
          <div className="glass rounded-2xl w-full max-w-md fade-in-up overflow-hidden"
            style={{ border: '1px solid var(--border-md)', boxShadow: '0 0 80px rgba(0,0,0,0.7), 0 0 30px rgba(37, 99, 235,0.06)' }}>

            {/* Modal header */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: (catColor[selectedTask.category] || {glow:'rgba(37, 99, 235,0.12)'}).glow,
                      border: `1px solid ${(catColor[selectedTask.category] || {border:'rgba(37, 99, 235,0.25)'}).border}`,
                    }}>
                    {catEmoji[selectedTask.category] || '🌿'}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-[15px] leading-tight">{selectedTask.title}</h2>
                    <p className="mono text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>
                      +{selectedTask.xpReward} XP on approval
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelectedTask(null); setSubmitError(''); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--tile)', color: 'var(--text-3)' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Task description */}
            <div className="px-6 pt-4">
              <div className="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
                style={{ background: 'var(--tile)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                {selectedTask.description}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submitTask} className="px-6 py-5 space-y-4">

              {/* Notes textarea */}
              <div>
                <label className="label block mb-2">What did you do? <span style={{ color: 'var(--accent)' }}>*</span></label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  placeholder="Describe your real-world eco action in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required />
              </div>

              {/* File upload */}
              <div>
                <label className="label block mb-2">Upload Proof <span style={{ color: 'var(--text-3)' }}>(Image only)</span></label>
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  className="rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-md)'}`,
                    background: dragOver ? 'rgba(37, 99, 235,0.06)' : 'var(--tile)',
                  }}>
                  {form.image ? (
                    <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: 'var(--text-2)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.25)' }}>
                        <CheckCircle size={14} style={{ color: 'var(--accent)' }} />
                      </div>
                      <span className="font-medium truncate max-w-[180px]">{form.image.name}</span>
                      <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                        ({(form.image.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-3)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                        <Upload size={18} />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-2)' }}>
                        Drag & drop or click to upload
                      </span>
                      <span className="text-[11px]">JPG · PNG · WebP · max 10 MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    validateAndSetFile(file);
                  }} />
              </div>

              {/* Teacher note */}
              <div className="flex items-center gap-2 text-[12px] rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(37, 99, 235,0.06)', border: '1px solid rgba(37, 99, 235,0.15)', color: 'var(--text-3)' }}>
                <span>👨‍🏫</span> Your teacher will review and award XP for your submission.
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-center gap-2 text-[12px] text-red-400 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.20)' }}>
                  <AlertCircle size={13} /> {submitError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setSelectedTask(null); setSubmitError(''); }}
                  className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>Submit Task →</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function CivicHub() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-4 md:p-6 pb-20 md:pb-8">
          {user?.role === 'teacher' ? <TeacherView /> : <StudentView />}
        </main>
      </div>
    </div>
  );
}
