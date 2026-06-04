import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, X, Check, Users, Inbox, ClipboardList, FileText, Trash2,
  ChevronDown, ChevronUp, Upload, ExternalLink, Pencil, BookOpen,
  ChevronRight, Download, Star, Save, Zap, TrendingUp, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api, { fileUrl } from '../api/axios';

const CLASSES = ['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','College Year 1','College Year 2','College Year 3'];
const CATEGORIES = ['waste','water','energy','cleanliness','plantation'];
const catIcon = { waste: '♻️', water: '💧', energy: '⚡', cleanliness: '🧹', plantation: '🌱' };
const emptyQ = () => ({ question: '', options: ['','','',''], correctIndex: 0, explanation: '' });

/* ── Modal overlay wrapper ── */
function Modal({ onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-2xl p-6 fade-in-up my-4"
        style={{
          maxWidth: wide ? '680px' : '460px',
          background: 'rgba(11,22,13,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-md)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59, 130, 246,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Shared question editor ── */
function QuestionEditor({ questions, setQuestions }) {
  const addQ = () => setQuestions(prev => [...prev, emptyQ()]);
  const removeQ = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi, oi, val) => setQuestions(prev => prev.map((q, i) => {
    if (i !== qi) return q;
    const opts = [...q.options]; opts[oi] = val; return { ...q, options: opts };
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold">
          Questions <span className="font-mono text-[11px] ml-1" style={{ color: 'var(--text-3)' }}>({questions.length})</span>
        </h3>
        <button type="button" onClick={addQ} className="btn-secondary text-[12px]" style={{ padding: '0.3rem 0.75rem' }}>
          <Plus size={11} /> Add
        </button>
      </div>
      <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl p-4" style={{ background: 'rgba(59, 130, 246,0.03)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="label" style={{ color: '#3b82f6' }}>Q{qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQ(qi)} className="transition-opacity opacity-40 hover:opacity-100" style={{ color: '#ff4757' }}>
                  <X size={12} />
                </button>
              )}
            </div>
            <input className="input text-[13px] mb-3" placeholder="Question..."
              value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} />
            <p className="text-[10px] mb-2" style={{ color: 'var(--text-4)' }}>Click the letter to mark the correct answer</p>
            <div className="space-y-1.5 mb-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 rounded-lg transition-all"
                  style={q.correctIndex === oi
                    ? { border: '1px solid rgba(37, 99, 235,0.40)', background: 'rgba(37, 99, 235,0.08)' }
                    : { border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <button type="button" onClick={() => updateQ(qi, 'correctIndex', oi)}
                    className="shrink-0 ml-2 w-6 h-6 rounded-md text-[10px] font-bold transition-all flex items-center justify-center"
                    style={q.correctIndex === oi
                      ? { background: 'rgba(37, 99, 235,0.20)', color: '#3b82f6', border: '1px solid rgba(37, 99, 235,0.40)' }
                      : { background: 'var(--tile)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                    {q.correctIndex === oi ? '✓' : String.fromCharCode(65 + oi)}
                  </button>
                  <input className="bg-transparent text-[12px] py-2 flex-1 outline-none pr-2"
                    style={{ color: q.correctIndex === oi ? '#3b82f6' : 'var(--text-2)' }}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt}
                    onChange={e => updateOpt(qi, oi, e.target.value)} />
                </div>
              ))}
            </div>
            <input className="input text-[12px] py-1.5" placeholder="Explanation (optional)"
              value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

const tabColors = {
  overview: '#3b82f6', submissions: '#fbbf24', tasks: '#00d4ff',
  tests: '#a855f7', content: '#ff6b35', students: '#3b82f6'
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  /* data */
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /* content tab nav */
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  /* subject / chapter editing */
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectClass, setNewSubjectClass] = useState('Class 9');
  const [editingSubject, setEditingSubject] = useState(null);
  const [addingChapterFor, setAddingChapterFor] = useState(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [editingChapter, setEditingChapter] = useState(null);

  /* modals */
  const [taskModal, setTaskModal] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [editQuizModal, setEditQuizModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [subFilter, setSubFilter] = useState('all');

  /* forms */
  const [taskForm, setTaskForm] = useState({ title: '', description: '', category: 'waste', type: 'daily', xpReward: 50, class: 'Class 9' });
  const [quizForm, setQuizForm] = useState({ title: '', subject: '', chapter: '', xpReward: 100 });
  const [questions, setQuestions] = useState([emptyQ()]);
  const [editQuizId, setEditQuizId] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState({ title: '', subject: '', chapter: '', xpReward: 100 });
  const [editQuestions, setEditQuestions] = useState([emptyQ()]);
  const [noteForm, setNoteForm] = useState({ title: '', subject: '', chapter: '', type: 'pdf', externalUrl: '' });
  const [noteFile, setNoteFile] = useState(null);
  const [noteUploading, setNoteUploading] = useState(false);
  const noteFileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/users/students'),
      api.get('/submissions'),
      api.get('/tasks'),
      api.get('/quizzes'),
      api.get('/notes'),
      api.get('/subjects'),
    ]).then(([s, sub, t, q, n, subj]) => {
      setStudents(s.data);
      setSubmissions(sub.data);
      setTasks(t.data);
      setQuizzes(q.data);
      setNotes(n.data);
      setSubjects(subj.data);
      if (subj.data.length) {
        setExpandedSubjects({ [subj.data[0].id]: true });
        setActiveSubjectId(subj.data[0].id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = submissions.filter(s => s.status === 'pending');

  const activeSubject = subjects.find(s => s.id === activeSubjectId);
  const activeChapter = activeSubject?.chapters.find(c => c.id === activeChapterId);
  const chapterQuizzes = activeSubject && activeChapter
    ? quizzes.filter(q => q.subject === activeSubject.name && q.chapter?.toLowerCase() === activeChapter.name.toLowerCase())
    : [];
  const chapterNotes = activeSubject && activeChapter
    ? notes.filter(n => n.subject === activeSubject.name && n.chapter?.toLowerCase() === activeChapter.name.toLowerCase())
    : [];

  /* ── tasks ── */
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tasks', { ...taskForm, "class": taskForm.class });
      setTasks([data, ...tasks]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', category: 'waste', type: 'daily', xpReward: 50, class: 'Class 9' });
    } catch {}
  };
  const deleteTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); setTasks(tasks.filter(t => t.id !== id)); } catch {}
  };

  /* ── quizzes ── */
  const createQuiz = async (e) => {
    e.preventDefault();
    const filled = questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    if (filled.length !== questions.length || !filled.length) {
      alert("Please fill out the question text and ALL 4 options for every question before publishing.");
      return;
    }
    try {
      const { data } = await api.post('/quizzes', { ...quizForm, questions: filled });
      if (!data) throw new Error("No data returned from server");
      setQuizzes([data, ...quizzes]);
      setQuizModal(false);
      setQuizForm({ title: '', subject: '', chapter: '', xpReward: 100 });
      setQuestions([emptyQ()]);
      alert("Test published successfully!");
    } catch (err) {
      alert("Failed to publish test! Check console for errors.");
      console.error("Publish Quiz Error:", err.response?.data || err.message);
    }
  };
  const openEditQuiz = (quiz) => {
    setEditQuizId(quiz.id);
    setEditQuizForm({ title: quiz.title, subject: quiz.subject, chapter: quiz.chapter, xpReward: quiz.xpReward });
    setEditQuestions(quiz.questions.map(q => ({ question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation || '' })));
    setEditQuizModal(true);
  };
  const saveEditQuiz = async (e) => {
    e.preventDefault();
    const filled = editQuestions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    if (filled.length !== editQuestions.length || !filled.length) {
      alert("Please fill out the question text and ALL 4 options for every question before saving.");
      return;
    }
    try {
      const { data } = await api.put(`/quizzes/${editQuizId}`, { ...editQuizForm, questions: filled });
      if (!data) throw new Error("No data returned from server");
      setQuizzes(quizzes.map(q => q.id === editQuizId ? data : q));
      setEditQuizModal(false);
      alert("Changes saved successfully!");
    } catch (err) {
      alert("Failed to save changes! Check console for errors.");
      console.error("Save Quiz Error:", err.response?.data || err.message);
    }
  };
  const deleteQuiz = async (id) => {
    try { await api.delete(`/quizzes/${id}`); setQuizzes(quizzes.filter(q => q.id !== id)); } catch {}
  };

  /* ── notes ── */
  const createNote = async (e) => {
    e.preventDefault();
    setNoteUploading(true);
    try {
      const fd = new FormData();
      Object.entries(noteForm).forEach(([k, v]) => fd.append(k, v));
      if (noteFile) fd.append('file', noteFile);
      const { data } = await api.post('/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNotes([data, ...notes]);
      setNoteModal(false);
      setNoteForm({ title: '', subject: '', chapter: '', type: 'pdf', externalUrl: '' });
      setNoteFile(null);
    } catch {} finally { setNoteUploading(false); }
  };
  const deleteNote = async (id) => {
    try { await api.delete(`/notes/${id}`); setNotes(notes.filter(n => n.id !== id)); } catch {}
  };

  /* ── subjects & chapters ── */
  const addSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    try {
      const { data } = await api.post('/subjects', { name, class: newSubjectClass });
      setSubjects([...subjects, data]);
      setExpandedSubjects(prev => ({ ...prev, [data.id]: true }));
      setActiveSubjectId(data.id);
      setActiveChapterId(null);
      setNewSubjectName(''); setNewSubjectClass('Class 9'); setAddingSubject(false);
    } catch {}
  };
  const saveSubjectName = async (id) => {
    const name = editingSubject?.name?.trim();
    if (!name) return;
    try {
      const { data } = await api.put(`/subjects/${id}`, { name });
      setSubjects(subjects.map(s => s.id === id ? data : s));
      setEditingSubject(null);
    } catch {}
  };
  const deleteSubject = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
      if (activeSubjectId === id) { setActiveSubjectId(null); setActiveChapterId(null); }
    } catch {}
  };
  const addChapter = async (subjectId) => {
    const name = newChapterName.trim();
    if (!name) return;
    try {
      const { data } = await api.post(`/subjects/${subjectId}/chapters`, { name });
      setSubjects(subjects.map(s => s.id === subjectId ? data : s));
      const newCh = data.chapters[data.chapters.length - 1];
      setActiveSubjectId(subjectId);
      setActiveChapterId(newCh.id);
      setNewChapterName(''); setAddingChapterFor(null);
    } catch {}
  };
  const saveChapterName = async (subjectId, chapterId) => {
    const name = editingChapter?.name?.trim();
    if (!name) return;
    try {
      const { data } = await api.put(`/subjects/${subjectId}/chapters/${chapterId}`, { name });
      setSubjects(subjects.map(s => s.id === subjectId ? data : s));
      setEditingChapter(null);
    } catch {}
  };
  const deleteChapter = async (subjectId, chapterId) => {
    try {
      const { data } = await api.delete(`/subjects/${subjectId}/chapters/${chapterId}`);
      setSubjects(subjects.map(s => s.id === subjectId ? data : s));
      if (activeChapterId === chapterId) setActiveChapterId(null);
    } catch {}
  };

  const submitReview = async (status) => {
    if (!reviewModal) return;
    try {
      const { data } = await api.put(`/submissions/${reviewModal.sub.id}/review`, { teacherScore: reviewModal.score, status });
      setSubmissions(submissions.map(s => s.id === reviewModal.sub.id ? { ...s, ...data, status } : s));
      setReviewModal(null);
    } catch {}
  };

  const openQuizModal = () => {
    setQuizForm({ title: '', subject: activeSubject?.name || '', chapter: activeChapter?.name || '', xpReward: 100 });
    setQuestions([emptyQ()]);
    setQuizModal(true);
  };
  const openNoteModal = () => {
    setNoteForm({ title: '', subject: activeSubject?.name || '', chapter: activeChapter?.name || '', type: 'pdf', externalUrl: '' });
    setNoteFile(null);
    setNoteModal(true);
  };

  const tabs = [
    { id: 'overview',    label: 'Overview',                                                        icon: ClipboardList },
    { id: 'submissions', label: `Reviews${pending.length ? ` (${pending.length})` : ''}`,          icon: Inbox },
    { id: 'tasks',       label: 'Tasks',                                                           icon: ClipboardList },
    { id: 'tests',       label: `Tests${quizzes.length ? ` (${quizzes.length})` : ''}`,            icon: FileText },
    { id: 'content',     label: 'Content',                                                         icon: BookOpen },
    { id: 'students',    label: 'Students',                                                        icon: Users },
  ];

  return (
    <div className="min-h-screen bw-theme" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-4 md:p-6 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display font-bold text-[22px] tracking-tight">Teacher Dashboard</h1>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>{user?.name} · {user?.school}</p>
              </div>
              <button
                onClick={() => setTaskModal(true)}
                className="btn-primary"
                style={{ boxShadow: '0 4px 20px rgba(37, 99, 235,0.30)' }}
              >
                <Plus size={14} /> Create Task
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap"
                  style={tab === id
                    ? {
                        background: `${tabColors[id]}12`,
                        color: tabColors[id],
                        border: `1px solid ${tabColors[id]}25`,
                        boxShadow: `0 0 12px ${tabColors[id]}10`,
                      }
                    : { color: 'var(--text-3)', border: '1px solid transparent' }
                  }
                >
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-5 fade-in-up">
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { icon: Users,        label: 'Students',        value: students.length,  color: '#3b82f6', tab: 'students' },
                    { icon: Inbox,        label: 'Pending Reviews', value: pending.length,   color: '#fbbf24', tab: 'submissions' },
                    { icon: ClipboardList,label: 'Tasks',           value: tasks.length,     color: '#00d4ff', tab: 'tasks' },
                    { icon: FileText,     label: 'Tests',           value: quizzes.length,   color: '#a855f7', tab: 'tests' },
                    { icon: Upload,       label: 'Notes',           value: notes.length,     color: '#ff6b35', tab: 'content' },
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => setTab(s.tab)}
                      className="rounded-2xl p-4 text-left hover-lift group"
                      style={{ background: `${s.color}08`, border: `1px solid ${s.color}18`, transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}30`; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}12`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}18`; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <s.icon size={16} className="mb-3" style={{ color: s.color }} />
                      <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</p>
                    </button>
                  ))}
                </div>

                {/* Bottom 2-col */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Pending submissions */}
                  <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[14px] font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full pulse" style={{ background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
                        Latest Pending
                      </h2>
                      <button onClick={() => setTab('submissions')} className="text-[12px] hover:text-white transition-colors" style={{ color: 'var(--text-3)' }}>View all →</button>
                    </div>
                    <div className="space-y-2">
                      {pending.slice(0, 3).map(sub => (
                        <div key={sub.id} className="flex items-center justify-between rounded-xl p-3 hover-lift" style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          <div>
                            <p className="text-[13px] font-medium">{sub.student?.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub.task?.title}</p>
                          </div>
                          <button onClick={() => setReviewModal({ sub, score: 7 })} className="btn-primary text-[11px]" style={{ padding: '0.3rem 0.75rem' }}>
                            Review
                          </button>
                        </div>
                      ))}
                      {pending.length === 0 && (
                        <div className="text-center py-6">
                          <Check size={20} className="mx-auto mb-2" style={{ color: '#3b82f6' }} />
                          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>All caught up ✓</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top students */}
                  <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[14px] font-semibold flex items-center gap-2">
                        <TrendingUp size={14} style={{ color: '#fbbf24' }} /> Top Students
                      </h2>
                      <Link to="/leaderboard" className="text-[12px] hover:text-white transition-colors" style={{ color: 'var(--text-3)' }}>Leaderboard →</Link>
                    </div>
                    <div className="space-y-2">
                      {[...students].sort((a, b) => b.xp - a.xp).slice(0, 5).map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                          <span className="text-[12px] font-bold w-5 text-center font-mono" style={{ color: i < 3 ? '#fbbf24' : 'var(--text-3)' }}>
                            {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                          </span>
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold"
                            style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.20)', color: '#3b82f6' }}>
                            {s.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate">{s.name}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{s.class}</p>
                          </div>
                          <span className="text-[13px] font-bold font-mono" style={{ color: '#3b82f6' }}>{s.xp} <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>XP</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBMISSIONS ── */}
            {tab === 'submissions' && (
              <div className="space-y-3 fade-in-up">
                <div className="flex gap-2 mb-2">
                  {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button key={f} onClick={() => setSubFilter(f)}
                      className="text-[12px] px-3 py-1.5 rounded-xl capitalize transition-all font-medium"
                      style={subFilter === f
                        ? { background: 'rgba(37, 99, 235,0.15)', color: '#3b82f6', border: '1px solid rgba(37, 99, 235,0.30)' }
                        : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                      {f}{f !== 'all' && ` (${submissions.filter(s => s.status === f).length})`}
                    </button>
                  ))}
                </div>
                {(() => {
                  const filtered = subFilter === 'all' ? submissions : submissions.filter(s => s.status === subFilter);
                  return filtered.length === 0 ? (
                    <div className="rounded-2xl p-14 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <Inbox size={28} className="mx-auto mb-2" style={{ color: 'var(--text-4)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No {subFilter !== 'all' ? subFilter : ''} submissions yet</p>
                    </div>
                  ) : filtered.map(sub => (
                    <div key={sub.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold"
                            style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.20)', color: '#3b82f6' }}>
                            {sub.student?.name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[13px]">{sub.student?.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{sub.task?.title} · {new Date(sub.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.status === 'approved' && <span className="badge badge-green">Approved</span>}
                          {sub.status === 'rejected' && <span className="badge badge-red">Rejected</span>}
                          {sub.status === 'pending' && (
                            <>
                              <span className="badge badge-yellow">Pending</span>
                              <button onClick={() => setReviewModal({ sub, score: 7 })} className="btn-primary text-[11px]" style={{ padding: '0.3rem 0.75rem' }}>Review</button>
                            </>
                          )}
                          <button onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)} style={{ color: 'var(--text-3)' }}>
                            {expandedSub === sub.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                      {expandedSub === sub.id && (
                        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {sub.imageUrl && (
                              <div className="w-full h-40 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center" style={{ border: '1px solid var(--border)' }}>
                                <img src={fileUrl(sub.imageUrl)} alt="proof" className="max-w-full max-h-full object-contain" />
                              </div>
                            )}
                            <div>
                              <p className="text-[11px] mb-1" style={{ color: 'var(--text-4)' }}>Description</p>
                              <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{sub.description}</p>
                              {sub.teacherScore != null && (
                                <p className="text-[11px] mt-2 font-mono" style={{ color: 'var(--text-3)' }}>
                                  Score: {sub.teacherScore}/10 · <span style={{ color: '#3b82f6' }}>+{sub.xpAwarded} XP</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* ── TASKS ── */}
            {tab === 'tasks' && (
              <div className="fade-in-up">
                <div className="flex justify-end mb-4">
                  <button onClick={() => setTaskModal(true)} className="btn-primary"><Plus size={13} /> Create Task</button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks.map(task => (
                    <div key={task.id} className="rounded-2xl p-5 hover-lift" style={{ background: 'var(--card)', border: '1px solid var(--border)', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{catIcon[task.category]}</span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-30 hover:opacity-100 transition-opacity" style={{ color: '#ff4757' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="font-semibold text-[14px] mb-1.5">{task.title}</p>
                      <p className="text-[12px] line-clamp-2 mb-3" style={{ color: 'var(--text-3)' }}>{task.description}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {[task.type, task.category].map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                            style={{ background: 'var(--tile)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>{tag}</span>
                        ))}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(37, 99, 235,0.10)', border: '1px solid rgba(37, 99, 235,0.20)', color: '#3b82f6' }}>+{task.xpReward} XP</span>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="col-span-3 rounded-2xl p-14 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <ClipboardList size={26} className="mx-auto mb-2" style={{ color: 'var(--text-4)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No tasks yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ALL TESTS ── */}
            {tab === 'tests' && (
              <div className="fade-in-up">
                <p className="text-[13px] mb-4" style={{ color: 'var(--text-3)' }}>{quizzes.length} total test{quizzes.length !== 1 ? 's' : ''} across all chapters</p>
                {quizzes.length === 0 ? (
                  <div className="rounded-2xl p-14 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <FileText size={28} className="mx-auto mb-2" style={{ color: 'var(--text-4)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No tests created yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map(q => (
                      <div key={q.id} className="flex items-center justify-between rounded-2xl p-4 hover-lift"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.20)' }}>
                            <FileText size={15} style={{ color: '#a855f7' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold truncate">{q.title}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {q.subject} · {q.chapter} · {q.class} · {q.questions?.length || 0} questions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[12px] font-mono" style={{ color: '#3b82f6' }}>+{q.xpReward} XP</span>
                          <button onClick={() => openEditQuiz(q)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteQuiz(q.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ff4757'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CONTENT ── */}
            {tab === 'content' && (
              <div className="flex gap-4 flex-col lg:flex-row fade-in-up">
                {/* Left panel */}
                <div className="lg:w-64 shrink-0 rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
                  <div className="px-4 pt-4 pb-2">
                    <h2 className="label">Curriculum</h2>
                  </div>
                  <div className="pb-2">
                    {subjects.map(subj => (
                      <div key={subj.id}>
                        <div className="group flex items-center gap-1 px-3 py-1.5 hover:bg-white/[0.03] transition-colors">
                          <button onClick={() => setExpandedSubjects(prev => ({ ...prev, [subj.id]: !prev[subj.id] }))}
                            className="shrink-0 p-0.5 rounded transition-transform"
                            style={{ transform: expandedSubjects[subj.id] ? 'rotate(90deg)' : 'none', color: 'var(--text-3)' }}>
                            <ChevronRight size={11} />
                          </button>
                          {editingSubject?.id === subj.id ? (
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <input autoFocus className="input text-[12px] py-0.5 flex-1 min-w-0"
                                value={editingSubject.name}
                                onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') saveSubjectName(subj.id); if (e.key === 'Escape') setEditingSubject(null); }} />
                              <button onClick={() => saveSubjectName(subj.id)} style={{ color: '#3b82f6' }}><Save size={11} /></button>
                              <button onClick={() => setEditingSubject(null)} style={{ color: 'var(--text-3)' }}><X size={11} /></button>
                            </div>
                          ) : (
                            <button onClick={() => { setActiveSubjectId(subj.id); setActiveChapterId(null); setExpandedSubjects(prev => ({ ...prev, [subj.id]: true })); }}
                              className="flex-1 min-w-0 text-left text-[13px] font-medium truncate"
                              style={{ color: activeSubjectId === subj.id && !activeChapterId ? 'white' : 'var(--text-2)' }}>
                              {subj.name}
                            </button>
                          )}
                          {editingSubject?.id !== subj.id && (
                            <>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                                style={{ background: 'rgba(37, 99, 235,0.12)', color: '#3b82f6', border: '1px solid rgba(37, 99, 235,0.20)' }}>
                                {subj.class || 'All'}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => setEditingSubject({ id: subj.id, name: subj.name })} className="p-0.5 rounded hover:text-white transition-colors" style={{ color: 'var(--text-3)' }}><Pencil size={10} /></button>
                                <button onClick={() => deleteSubject(subj.id)} className="p-0.5 rounded hover:text-red-400 transition-colors" style={{ color: 'var(--text-3)' }}><Trash2 size={10} /></button>
                              </div>
                            </>
                          )}
                        </div>

                        {expandedSubjects[subj.id] && (
                          <div className="pl-5 pb-1">
                            {subj.chapters.map(ch => (
                              <div key={ch.id} className="group flex items-center gap-1.5 pl-2 pr-3 py-1 hover:bg-white/[0.03] rounded-lg mx-1 transition-colors">
                                {editingChapter?.chapterId === ch.id ? (
                                  <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <input autoFocus className="input text-[12px] py-0.5 flex-1 min-w-0"
                                      value={editingChapter.name}
                                      onChange={e => setEditingChapter({ ...editingChapter, name: e.target.value })}
                                      onKeyDown={e => { if (e.key === 'Enter') saveChapterName(subj.id, ch.id); if (e.key === 'Escape') setEditingChapter(null); }} />
                                    <button onClick={() => saveChapterName(subj.id, ch.id)} style={{ color: '#3b82f6' }}><Save size={11} /></button>
                                    <button onClick={() => setEditingChapter(null)} style={{ color: 'var(--text-3)' }}><X size={11} /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setActiveSubjectId(subj.id); setActiveChapterId(ch.id); }}
                                    className="flex-1 min-w-0 text-left text-[12px] truncate rounded-lg transition-colors"
                                    style={{ color: activeChapterId === ch.id ? '#3b82f6' : 'var(--text-3)', fontWeight: activeChapterId === ch.id ? 500 : 400 }}>
                                    {ch.name}
                                  </button>
                                )}
                                {editingChapter?.chapterId !== ch.id && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => setEditingChapter({ chapterId: ch.id, name: ch.name })} className="hover:text-white transition-colors" style={{ color: 'var(--text-3)' }}><Pencil size={9} /></button>
                                    <button onClick={() => deleteChapter(subj.id, ch.id)} className="hover:text-red-400 transition-colors" style={{ color: 'var(--text-3)' }}><Trash2 size={9} /></button>
                                  </div>
                                )}
                              </div>
                            ))}
                            {addingChapterFor === subj.id ? (
                              <div className="flex items-center gap-1.5 pl-2 pr-3 py-1 mx-1">
                                <input autoFocus className="input text-[12px] py-0.5 flex-1" placeholder="Chapter name..."
                                  value={newChapterName}
                                  onChange={e => setNewChapterName(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') addChapter(subj.id); if (e.key === 'Escape') { setAddingChapterFor(null); setNewChapterName(''); } }} />
                                <button onClick={() => addChapter(subj.id)} style={{ color: '#3b82f6' }}><Save size={11} /></button>
                                <button onClick={() => { setAddingChapterFor(null); setNewChapterName(''); }} style={{ color: 'var(--text-3)' }}><X size={11} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setAddingChapterFor(subj.id); setNewChapterName(''); }}
                                className="flex items-center gap-1.5 pl-2 py-1 mx-1 text-[11px] rounded-lg transition-colors hover:text-white"
                                style={{ color: 'var(--text-4)' }}>
                                <Plus size={10} /> Add chapter
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="px-3 pt-1 pb-3">
                      {addingSubject ? (
                        <div className="space-y-1.5">
                          <input autoFocus className="input text-[12px] py-1 w-full" placeholder="Subject name..."
                            value={newSubjectName}
                            onChange={e => setNewSubjectName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Escape') { setAddingSubject(false); setNewSubjectName(''); setNewSubjectClass('Class 9'); } }} />
                          <select className="input text-[12px] py-1 w-full" value={newSubjectClass} onChange={e => setNewSubjectClass(e.target.value)}>
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex gap-1.5">
                            <button onClick={addSubject} className="btn-primary text-[11px] flex-1" style={{ padding: '0.3rem 0' }}><Save size={11} /> Save</button>
                            <button onClick={() => { setAddingSubject(false); setNewSubjectName(''); setNewSubjectClass('Class 9'); }} className="btn-secondary text-[11px]" style={{ padding: '0.3rem 0.6rem' }}><X size={11} /></button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingSubject(true)}
                          className="flex items-center gap-1.5 text-[12px] w-full py-1.5 px-2 rounded-lg transition-colors hover:bg-white/[0.04]"
                          style={{ color: 'var(--text-4)' }}>
                          <Plus size={11} /> Add Subject
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="flex-1 min-w-0 space-y-4">
                  {!activeChapter ? (
                    <div className="rounded-2xl p-14 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <BookOpen size={28} className="mx-auto mb-3" style={{ color: 'var(--text-4)' }} />
                      <p className="text-[14px] font-medium mb-1">{subjects.length === 0 ? 'Build your curriculum' : 'Select a chapter'}</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                        {subjects.length === 0 ? 'Add a subject and chapters from the left panel.' : 'Choose a chapter to manage its tests and notes.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div>
                          <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>{activeSubject?.name}</p>
                          <h2 className="text-[17px] font-bold">{activeChapter.name}</h2>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={openNoteModal} className="btn-secondary text-[12px]"><Upload size={12} /> Note</button>
                          <button onClick={openQuizModal} className="btn-primary text-[12px]"><Plus size={12} /> Add Test</button>
                        </div>
                      </div>

                      {/* Tests */}
                      <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <h3 className="text-[13px] font-semibold flex items-center gap-2 mb-3">
                          <FileText size={13} style={{ color: 'var(--text-3)' }} /> Tests
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>({chapterQuizzes.length})</span>
                        </h3>
                        {chapterQuizzes.length === 0 ? (
                          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--tile)' }}>
                            <p className="text-[12px] mb-3" style={{ color: 'var(--text-3)' }}>No tests for this chapter yet</p>
                            <button onClick={openQuizModal} className="btn-primary text-[12px] mx-auto"><Plus size={11} /> Create Test</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {chapterQuizzes.map(quiz => (
                              <div key={quiz.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.20)' }}>
                                    <FileText size={13} style={{ color: '#a855f7' }} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-medium truncate">{quiz.title}</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{quiz.class} · {quiz.questions?.length || 0} questions</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[11px] font-mono" style={{ color: '#3b82f6' }}>+{quiz.xpReward} XP</span>
                                  <button onClick={() => openEditQuiz(quiz)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => deleteQuiz(quiz.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ff4757'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <h3 className="text-[13px] font-semibold flex items-center gap-2 mb-3">
                          <Upload size={13} style={{ color: 'var(--text-3)' }} /> Study Materials
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>({chapterNotes.length})</span>
                        </h3>
                        {chapterNotes.length === 0 ? (
                          <div className="rounded-xl p-6 text-center" style={{ background: 'var(--tile)' }}>
                            <p className="text-[12px] mb-3" style={{ color: 'var(--text-3)' }}>No notes uploaded for this chapter</p>
                            <button onClick={openNoteModal} className="btn-secondary text-[12px] mx-auto"><Upload size={11} /> Upload Notes</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {chapterNotes.map(note => (
                              <div key={note.id} className="rounded-xl p-3" style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg shrink-0">{note.type === 'pdf' ? '📄' : note.type === 'video' ? '🎥' : note.type === 'image' ? '🖼️' : '🔗'}</span>
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-medium truncate">{note.title}</p>
                                      <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{note.class} · {note.type.toUpperCase()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {(note.fileUrl || note.externalUrl) && (
                                      <a href={note.fileUrl ? fileUrl(note.fileUrl) : note.externalUrl}
                                        target="_blank" rel="noopener noreferrer"
                                        download={(note.type === 'pdf' || note.type === 'image') ? (note.fileOriginalName || true) : undefined}
                                        className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                        {(note.type === 'pdf' || note.type === 'image') ? <Download size={12} /> : <ExternalLink size={12} />}
                                      </a>
                                    )}
                                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
                                      onMouseEnter={e => e.currentTarget.style.color = '#ff4757'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                {note.type === 'image' && note.fileUrl && (
                                  <div className="mt-3 w-full rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                    <img src={fileUrl(note.fileUrl)} alt={note.title} className="w-full h-auto object-contain block" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── STUDENTS ── */}
            {tab === 'students' && (
              <div className="rounded-2xl overflow-hidden fade-in-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {loading ? (
                  <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-12 rounded-xl" />
                  ))}</div>
                ) : (
                  <table className="w-full text-[13px]">
                    <thead style={{ borderBottom: '1px solid var(--border)' }}>
                      <tr className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                        <th className="text-left px-5 py-3">Name</th>
                        <th className="text-left px-5 py-3 hidden sm:table-cell">Class</th>
                        <th className="text-right px-5 py-3">XP</th>
                        <th className="text-right px-5 py-3 hidden md:table-cell">Level</th>
                        <th className="text-right px-5 py-3 hidden md:table-cell">Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...students].sort((a, b) => b.xp - a.xp).map((s, i) => (
                        <tr key={s.id}
                          style={{ borderBottom: i < students.length - 1 ? '1px solid var(--border)' : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold"
                                style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.20)', color: '#3b82f6' }}>
                                {s.name[0]}
                              </div>
                              <span className="font-medium">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell" style={{ color: 'var(--text-3)' }}>{s.class}</td>
                          <td className="px-5 py-3 text-right font-bold font-mono" style={{ color: '#3b82f6' }}>{s.xp}</td>
                          <td className="px-5 py-3 text-right hidden md:table-cell" style={{ color: 'var(--text-3)' }}>Lv.{s.level}</td>
                          <td className="px-5 py-3 text-right hidden md:table-cell" style={{ color: 'var(--text-3)' }}>{s.streak}🔥</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Create Task Modal ── */}
      {taskModal && (
        <Modal onClose={() => setTaskModal(false)}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-[18px]">Create Task</h2>
            <button onClick={() => setTaskModal(false)} style={{ color: 'var(--text-3)' }}><X size={16} /></button>
          </div>
          <form onSubmit={createTask} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Title</label>
              <input className="input" placeholder="Plant a tree near school"
                value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="label block mb-1.5">Description</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="What should students do?"
                value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Category</label>
                <select className="input" value={taskForm.category} onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Type</label>
                <select className="input" value={taskForm.type} onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}>
                  {['daily', 'weekly', 'mission'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Class</label>
                <select className="input" value={taskForm.class} onChange={e => setTaskForm({ ...taskForm, class: e.target.value })}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">XP Reward: <span className="font-mono font-bold" style={{ color: '#3b82f6' }}>{taskForm.xpReward}</span></label>
                <input type="range" min="10" max="200" step="10" className="w-full mt-2" style={{ accentColor: '#2563eb' }}
                  value={taskForm.xpReward} onChange={e => setTaskForm({ ...taskForm, xpReward: +e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setTaskModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Create Task</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Quiz Modal (create + edit) ── */}
      {(quizModal || editQuizModal) && (() => {
        const isEdit = editQuizModal;
        const form = isEdit ? editQuizForm : quizForm;
        const setForm = isEdit ? setEditQuizForm : setQuizForm;
        const qs = isEdit ? editQuestions : questions;
        const setQs = isEdit ? setEditQuestions : setQuestions;
        const onSubmit = isEdit ? saveEditQuiz : createQuiz;
        const onClose = () => { if (isEdit) setEditQuizModal(false); else { setQuizModal(false); setQuestions([emptyQ()]); } };
        const fromContent = tab === 'content' && activeChapter;

        return (
          <Modal onClose={onClose} wide>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-[18px]">{isEdit ? 'Edit Test' : 'Create Test'}</h2>
              <button onClick={onClose} style={{ color: 'var(--text-3)' }}><X size={16} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label block mb-1.5">Test Title</label>
                  <input className="input" placeholder="e.g. Ecosystem Basics Quiz"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="label block mb-1.5">Subject</label>
                  {fromContent && !isEdit
                    ? <input className="input" value={form.subject} readOnly style={{ opacity: 0.5 }} />
                    : <input className="input" placeholder="e.g. Environmental Science" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                  }
                </div>
                <div>
                  <label className="label block mb-1.5">Chapter</label>
                  {fromContent && !isEdit
                    ? <input className="input" value={form.chapter} readOnly style={{ opacity: 0.5 }} />
                    : <input className="input" placeholder="e.g. Ecosystem" value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })} required />
                  }
                </div>
                <div>
                  <label className="label block mb-1.5">XP Reward: <span className="font-mono font-bold" style={{ color: '#3b82f6' }}>{form.xpReward}</span></label>
                  <input type="range" min="50" max="300" step="25" className="w-full mt-2" style={{ accentColor: '#2563eb' }}
                    value={form.xpReward} onChange={e => setForm({ ...form, xpReward: +e.target.value })} />
                </div>
              </div>
              <QuestionEditor questions={qs} setQuestions={setQs} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {isEdit ? <><Save size={13} /> Save Changes</> : <>Publish Test ({qs.length}Q)</>}
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {/* ── Upload Notes Modal ── */}
      {noteModal && (
        <Modal onClose={() => setNoteModal(false)}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-[18px]">Upload Study Material</h2>
            <button onClick={() => setNoteModal(false)} style={{ color: 'var(--text-3)' }}><X size={16} /></button>
          </div>
          <form onSubmit={createNote} className="space-y-3">
            <div>
              <label className="label block mb-1.5">Title</label>
              <input className="input" placeholder="e.g. Chapter 1 – Key Notes"
                value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label block mb-1.5">Subject</label>
                <input className="input" placeholder="Environmental Science"
                  value={noteForm.subject} onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })} required />
              </div>
              <div>
                <label className="label block mb-1.5">Chapter</label>
                <input className="input" placeholder="e.g. Ecosystem"
                  value={noteForm.chapter} onChange={e => setNoteForm({ ...noteForm, chapter: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label block mb-1.5">Type</label>
              <select className="input" value={noteForm.type} onChange={e => setNoteForm({ ...noteForm, type: e.target.value })}>
                <option value="pdf">PDF / Document</option>
                <option value="image">Image Only</option>
                <option value="url">Link / URL</option>
                <option value="video">Video Link</option>
              </select>
            </div>
            {(noteForm.type === 'pdf' || noteForm.type === 'image') ? (
              <div>
                <label className="label block mb-1.5">{noteForm.type === 'image' ? 'Image File' : 'Document File'}</label>
                <div
                  className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
                  style={{ borderColor: noteFile ? 'rgba(37, 99, 235,0.5)' : 'var(--border-md)', background: noteFile ? 'rgba(37, 99, 235,0.04)' : 'var(--tile)' }}
                  onClick={() => noteFileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setNoteFile(f); }}
                >
                  <input ref={noteFileRef} type="file" accept={noteForm.type === 'image' ? "image/*" : ".pdf,.doc,.docx,.ppt,.pptx"} className="hidden"
                    onChange={e => {
                      const f = e.target.files[0] || null;
                      if (f && f.size > 10 * 1024 * 1024) { alert('File must be under 10 MB'); e.target.value = ''; return; }
                      setNoteFile(f);
                    }} />
                  {noteFile
                    ? <p className="text-[13px]" style={{ color: '#3b82f6' }}>{noteForm.type === 'image' ? '🖼️' : '📄'} {noteFile.name} <span style={{ color: 'var(--text-3)' }}>({(noteFile.size / (1024 * 1024)).toFixed(1)} MB)</span></p>
                    : <>
                        <Upload size={20} className="mx-auto mb-2" style={{ color: 'var(--text-4)' }} />
                        <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Click or drag to upload {noteForm.type === 'image' ? 'Image' : 'PDF / DOC / PPT'}</p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-4)' }}>Max 10 MB</p>
                      </>
                  }
                </div>
              </div>
            ) : (
              <div>
                <label className="label block mb-1.5">{noteForm.type === 'video' ? 'Video URL' : 'Link URL'}</label>
                <input className="input" placeholder="https://..."
                  value={noteForm.externalUrl} onChange={e => setNoteForm({ ...noteForm, externalUrl: e.target.value })} required />
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setNoteModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={noteUploading} className="btn-primary flex-1 justify-center">
                {noteUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <Modal onClose={() => setReviewModal(null)}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-[18px]">Review Submission</h2>
            <button onClick={() => setReviewModal(null)} style={{ color: 'var(--text-3)' }}><X size={16} /></button>
          </div>
          <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(59, 130, 246,0.04)', border: '1px solid rgba(37, 99, 235,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-[13px]">{reviewModal.sub.student?.name}</span>
              <span style={{ color: 'var(--text-3)' }}>·</span>
              <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{reviewModal.sub.task?.title}</span>
            </div>
            {reviewModal.sub.imageUrl && (
              <div className="w-full h-48 bg-black/20 rounded-xl mb-3 flex items-center justify-center overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={fileUrl(reviewModal.sub.imageUrl)} alt="proof" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{reviewModal.sub.description}</p>
          </div>
          <div className="mb-6">
            <label className="label block mb-2">
              Score: <span className="font-mono font-bold text-[17px] ml-1 text-white">{reviewModal.score}/10</span>
              <span className="ml-2 font-mono text-[12px]" style={{ color: '#3b82f6' }}>→ +{Math.round((reviewModal.score / 10) * (reviewModal.sub.task?.xpReward || 50))} XP</span>
            </label>
            <input type="range" min="1" max="10" className="w-full" style={{ accentColor: '#2563eb' }}
              value={reviewModal.score} onChange={e => setReviewModal({ ...reviewModal, score: +e.target.value })} />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
              <span>1</span><span>5</span><span>10</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => submitReview('rejected')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              style={{ border: '1px solid rgba(255,71,87,0.30)', color: '#ff6b7a' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X size={13} /> Reject
            </button>
            <button onClick={() => submitReview('approved')} className="btn-primary flex-1 justify-center">
              <Check size={13} /> Approve
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
