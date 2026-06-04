import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Star, Trophy,
  Shield, Zap, Target, RotateCcw, BookOpen, ChevronLeft
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

/* ── Score ring SVG ── */
function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#3b82f6' : score >= 50 ? '#fbbf24' : '#ff4757';
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-bold font-display" style={{ color }}>{score}%</p>
        <p className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>Score</p>
      </div>
    </div>
  );
}

/* ── Answer option pill ── */
function AnswerOption({ option, index, selected, revealed, isCorrect, onClick }) {
  const letter = String.fromCharCode(65 + index);
  let bg = 'var(--tile)';
  let border = 'var(--border)';
  let textColor = 'var(--text-2)';
  let glow = 'none';
  let letterColor = 'var(--text-3)';

  if (revealed) {
    if (isCorrect) {
      bg = 'rgba(59, 130, 246,0.10)'; border = 'rgba(59, 130, 246,0.40)';
      textColor = '#3b82f6'; letterColor = '#3b82f6';
      glow = '0 0 20px rgba(59, 130, 246,0.15)';
    } else if (selected) {
      bg = 'rgba(255,71,87,0.10)'; border = 'rgba(255,71,87,0.40)';
      textColor = '#ff4757'; letterColor = '#ff4757';
    }
  } else if (selected) {
    bg = 'rgba(37, 99, 235,0.12)'; border = 'rgba(37, 99, 235,0.40)';
    textColor = '#3b82f6'; letterColor = '#3b82f6';
    glow = '0 0 16px rgba(37, 99, 235,0.12)';
  }

  return (
    <button onClick={onClick} disabled={revealed}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 hover-lift disabled:cursor-default"
      style={{ background: bg, border: `1px solid ${border}`, boxShadow: glow, color: textColor }}>
      <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-[12px] font-bold font-mono transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, color: letterColor }}>
        {letter}
      </span>
      <span className="text-[14px] font-medium leading-snug flex-1">{option}</span>
      {revealed && isCorrect && <CheckCircle size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />}
      {revealed && selected && !isCorrect && <XCircle size={16} style={{ color: '#ff4757', flexShrink: 0 }} />}
    </button>
  );
}

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(r => { setQuiz(r.data); setAnswers(new Array(r.data.questions.length).fill(null)); })
      .catch((err) => {
        if (err.response?.status === 403) {
          setSubmitError(err.response.data.message || 'You have already attempted this test.');
        } else {
          navigate('/learn');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const select = (idx) => {
    const a = [...answers]; a[current] = idx; setAnswers(a);
  };

  const goTo = (idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setCurrent(idx); setTransitioning(false); }, 180);
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult(data);
    } catch {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(37, 99, 235,0.12)', border: '1px solid rgba(37, 99, 235,0.25)' }}>
          <BookOpen size={24} style={{ color: '#3b82f6' }} className="animate-pulse" />
        </div>
        <p className="text-[14px] font-medium" style={{ color: 'var(--text-3)' }}>Loading quiz…</p>
      </div>
    </div>
  );

  /* ── Error / locked ── */
  if (!quiz) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="rounded-2xl p-10 max-w-sm w-full text-center"
        style={{ background: 'var(--card)', border: '1px solid rgba(255,71,87,0.25)', boxShadow: '0 0 40px rgba(255,71,87,0.08)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,71,87,0.10)', border: '1px solid rgba(255,71,87,0.25)' }}>
          <Shield size={28} style={{ color: '#ff4757' }} />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Test Locked</h2>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>{submitError || 'Unable to load test.'}</p>
        <Link to="/learn" className="btn-primary w-full justify-center">← Back to Learn</Link>
      </div>
    </div>
  );

  const q = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const answered = answers.filter(a => a !== null).length;

  /* ── Result screen ── */
  if (result) {
    const emoji = result.score >= 70 ? '🏆' : result.score >= 50 ? '👍' : '📚';
    const headline = result.score >= 70 ? 'Excellent Work!' : result.score >= 50 ? 'Good Job!' : 'Keep Practicing!';
    const subline = result.score >= 70 ? "You're crushing it!" : result.score >= 50 ? 'Solid performance.' : "Every attempt builds knowledge.";
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-56 p-4 md:p-6 pb-20 md:pb-8 flex items-start justify-center pt-8">
            <div className="w-full max-w-xl fade-in-up">
              {/* Score header */}
              <div className="rounded-2xl p-8 text-center mb-4 relative overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="absolute inset-0 pointer-events-none opacity-30"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246,0.12), transparent 60%)' }} />

                <div className="text-4xl mb-2">{emoji}</div>
                <h2 className="font-display text-2xl font-bold mb-1">{headline}</h2>
                <p className="text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>{subline}</p>

                <div className="flex items-center justify-center mb-6">
                  <ScoreRing score={result.score} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Correct', value: result.correct, color: '#3b82f6', icon: CheckCircle },
                    { label: 'Wrong', value: result.total - result.correct, color: '#ff4757', icon: XCircle },
                    { label: 'XP Earned', value: `+${result.xpEarned}`, color: '#fbbf24', icon: Star },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="rounded-xl p-3"
                      style={{ background: 'var(--tile)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-center mb-1.5">
                        <Icon size={14} style={{ color }} />
                      </div>
                      <p className="text-[18px] font-bold font-mono" style={{ color }}>{value}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question breakdown */}
              <div className="rounded-2xl p-5 mb-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                  Question Breakdown
                </p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
                  {result.results.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                      style={{
                        background: r.isCorrect ? 'rgba(59, 130, 246,0.04)' : 'rgba(255,71,87,0.05)',
                        border: `1px solid ${r.isCorrect ? 'rgba(59, 130, 246,0.15)' : 'rgba(255,71,87,0.18)'}`,
                      }}>
                      <div className="shrink-0 mt-0.5">
                        {r.isCorrect
                          ? <CheckCircle size={14} style={{ color: '#3b82f6' }} />
                          : <XCircle size={14} style={{ color: '#ff4757' }} />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium leading-snug">{r.question}</p>
                        {!r.isCorrect && r.explanation && (
                          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>{r.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/learn" className="btn-secondary justify-center flex items-center gap-2">
                  <BookOpen size={14} /> Back to Learn
                </Link>
                <Link to="/dashboard" className="btn-primary justify-center flex items-center gap-2">
                  <Trophy size={14} /> Dashboard
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ── Quiz screen ── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Fixed top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1" style={{ background: 'var(--tile)' }}>
          <div className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              boxShadow: '0 0 10px rgba(59, 130, 246,0.50)',
            }} />
        </div>
      </div>

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 p-4 md:p-6 pb-20 md:pb-8 flex items-start justify-center pt-8">
          <div className="w-full max-w-2xl">

            {/* Quiz header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display font-bold text-lg tracking-tight">{quiz.title}</h1>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {quiz.subject} · {quiz.class}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[12px] font-mono px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                  {answered}/{quiz.questions.length} answered
                </div>
                <div className="text-[13px] font-mono font-bold px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(59, 130, 246,0.08)', border: '1px solid rgba(59, 130, 246,0.20)', color: '#3b82f6' }}>
                  {current + 1}/{quiz.questions.length}
                </div>
              </div>
            </div>

            {/* Question card */}
            <div ref={cardRef}
              className="rounded-2xl p-6 mb-4 transition-all duration-200"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
              }}>
              {/* Question meta */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[11px] px-2.5 py-1 rounded-xl font-mono font-bold"
                  style={{ background: 'var(--tile)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  Q{current + 1}
                </span>
                <span className="text-[11px] flex items-center gap-1 font-mono font-bold"
                  style={{ color: '#3b82f6' }}>
                  <Zap size={10} />+{Math.round(quiz.xpReward / quiz.questions.length)} XP
                </span>
              </div>

              {/* Question text */}
              <p className="text-[16px] font-semibold leading-relaxed mb-6" style={{ color: 'var(--text)' }}>
                {q.question}
              </p>

              {/* Answer options */}
              <div className="space-y-2.5 mb-6">
                {q.options.map((opt, i) => (
                  <AnswerOption key={i} option={opt} index={i}
                    selected={answers[current] === i}
                    revealed={false}
                    isCorrect={false}
                    onClick={() => select(i)} />
                ))}
              </div>

              {/* Navigation row */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => goTo(current - 1)} disabled={current === 0}
                  className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-25 hover:bg-white/5"
                  style={{ color: 'var(--text-2)' }}>
                  <ChevronLeft size={15} /> Prev
                </button>

                {current === quiz.questions.length - 1 ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <button onClick={submitQuiz} disabled={answered === 0 || submitting}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      <Trophy size={14} />
                      {submitting ? 'Submitting…' : 'Submit Quiz'}
                    </button>
                    {submitError && <p className="text-[11px]" style={{ color: '#ff4757' }}>{submitError}</p>}
                  </div>
                ) : (
                  <button onClick={() => goTo(current + 1)}
                    className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-xl transition-all hover:bg-white/5"
                    style={{ color: 'var(--text-2)' }}>
                    Next <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Question nav dots */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quiz.questions.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="w-8 h-8 rounded-xl text-[11px] font-bold font-mono transition-all duration-200"
                  style={i === current
                    ? { background: '#2563eb', color: '#000', boxShadow: '0 0 12px rgba(37, 99, 235,0.40)' }
                    : answers[i] !== null
                    ? { background: 'rgba(59, 130, 246,0.10)', border: '1px solid rgba(59, 130, 246,0.25)', color: '#3b82f6' }
                    : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-3)' }
                  }>{i + 1}</button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
