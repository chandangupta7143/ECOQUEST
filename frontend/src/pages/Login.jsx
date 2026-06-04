import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, Leaf, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { validateEmail } from '../utils/validateEmail';

/* ─── tiny spinner ──────────────────────────────────────────── */
function Spinner() {
  return (
    <span
      style={{
        width: 16, height: 16,
        border: '2px solid rgba(0,26,10,0.3)',
        borderTopColor: '#001a0a',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [form, setForm]               = useState({ email: '', password: '' });
  const [error, setError]             = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError]   = useState('');
  const [emailOk, setEmailOk]         = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent

  /* ── helpers ── */
  const runEmailValidation = (val) => {
    if (!val.includes('@')) { setEmailError(''); setEmailOk(false); return; }
    const chk = validateEmail(val);
    setEmailError(chk.valid ? '' : chk.reason);
    setEmailOk(chk.valid);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, email: val }));
    if (emailTouched) runEmailValidation(val);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    runEmailValidation(form.email);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotVerified(false);

    setEmailTouched(true);
    const check = validateEmail(form.email);
    if (!check.valid) {
      setEmailError(check.reason);
      setEmailOk(false);
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.notVerified) {
        setNotVerified(true);
        setError(data.message);
      } else {
        setError(data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── resend verification ── */
  const handleResend = async () => {
    setResendState('sending');
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  /* ── border colour for email field ── */
  const emailBorderStyle = () => {
    if (!emailTouched || !form.email) return {};
    if (emailOk)    return { borderColor: 'rgba(37, 99, 235,0.5)',  background: 'rgba(37, 99, 235,0.04)' };
    if (emailError) return { borderColor: 'rgba(255,71,87,0.5)',  background: 'rgba(255,71,87,0.04)'  };
    return {};
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Ambient orbs ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        {/* top-right green */}
        <div style={{
          position: 'absolute',
          width: 680, height: 680,
          top: -220, right: -160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235,0.13) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-drift 22s ease-in-out infinite',
        }} />
        {/* bottom-left cyan */}
        <div style={{
          position: 'absolute',
          width: 480, height: 480,
          bottom: -120, left: -100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-drift 28s ease-in-out infinite',
          animationDelay: '-10s',
        }} />
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />
      </div>

      {/* ── Card ── */}
      <div
        className="w-full fade-in-up"
        style={{ maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-7 group">
            <div
              className="hover-lift"
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(37, 99, 235,0.22) 0%, rgba(59, 130, 246,0.10) 100%)',
                border: '1px solid rgba(37, 99, 235,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(37, 99, 235,0.18)',
                transition: 'all 0.25s ease',
              }}
            >
              <Leaf size={20} style={{ color: '#3b82f6' }} />
            </div>
            <span
              className="font-display"
              style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)' }}
            >
              EcoQuest
            </span>
          </Link>

          <h1
            className="font-display"
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Continue your eco journey
          </p>
        </div>

        {/* Glassmorphic card */}
        <div
          style={{
            background: 'rgba(11,22,13,0.70)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--border-md)',
            borderRadius: 24,
            padding: '2.5rem',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(59, 130, 246,0.04)',
          }}
        >
          {/* Standard error banner */}
          {error && !notVerified && (
            <div
              className="fade-in"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: 13, color: '#ff6b7a',
                background: 'rgba(255,71,87,0.09)',
                border: '1px solid rgba(255,71,87,0.22)',
                borderRadius: 12, padding: '10px 14px',
                marginBottom: 20,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Not-verified banner */}
          {notVerified && (
            <div
              className="fade-in"
              style={{
                background: 'rgba(251,191,36,0.09)',
                border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 12, padding: '12px 14px',
                marginBottom: 20,
              }}
            >
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#fbbf24' }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Email not verified. Check your inbox or resend the link below.</span>
              </p>
              <div style={{ marginTop: 8, paddingLeft: 22 }}>
                {resendState === 'sent' ? (
                  <span style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={12} /> New link sent! Check your inbox.
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendState === 'sending'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: '#fde68a',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, opacity: resendState === 'sending' ? 0.6 : 1,
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#fff'}
                    onMouseOut={e => e.currentTarget.style.color = '#fde68a'}
                  >
                    <RefreshCw size={11} className={resendState === 'sending' ? 'spin' : ''} />
                    {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email field */}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 7 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: emailTouched && form.email
                      ? (emailOk ? '#2563eb' : emailError ? '#ff6b7a' : 'var(--text-3)')
                      : 'var(--text-3)',
                    transition: 'color 0.2s',
                  }}
                />
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  required
                  style={{
                    paddingLeft: 40, paddingRight: 36,
                    ...emailBorderStyle(),
                  }}
                />
                {/* right indicator */}
                {emailTouched && form.email && (
                  emailOk
                    ? <CheckCircle size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#2563eb' }} />
                    : emailError
                      ? <XCircle size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#ff6b7a' }} />
                      : null
                )}
              </div>
              {emailTouched && emailError && (
                <p style={{ fontSize: 11, color: '#ff6b7a', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={10} /> {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-3)',
                  }}
                />
                <input
                  id="login-password"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--text-3)', display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--text-2)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-3)'}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: 4, fontSize: 15, fontWeight: 700 }}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span style={{ marginLeft: 6 }}>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            No account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--accent-b)', fontWeight: 600, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--accent-b)'}
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
