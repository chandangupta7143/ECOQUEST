import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  AlertCircle, Leaf, GraduationCap, BookOpen,
  CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { validateEmail as validateEmailBase } from '../utils/validateEmail';

/* ─── Validators ────────────────────────────────────────────── */
function validateEmailFrontend(email) {
  if (!email || !email.trim()) return { valid: false, message: '' };
  const result = validateEmailBase(email);
  return { valid: result.valid, message: result.reason || '' };
}

function validatePasswordFrontend(password) {
  if (!password) return { valid: false, message: '' };
  if (password.length < 6)  return { valid: false, message: 'Password must be at least 6 characters' };
  if (password.length > 128) return { valid: false, message: 'Password is too long' };
  return { valid: true, message: '' };
}

/* ─── Spinner ───────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      border: '2px solid rgba(0,26,10,0.3)',
      borderTopColor: '#001a0a',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

/* ─── Ambient background (shared) ──────────────────────────── */
function AmbientBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 680, height: 680, top: -220, right: -160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235,0.13) 0%, transparent 70%)',
        filter: 'blur(80px)', animation: 'orb-drift 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 480, height: 480, bottom: -120, left: -100,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)',
        filter: 'blur(80px)', animation: 'orb-drift 28s ease-in-out infinite',
        animationDelay: '-10s',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }} />
    </div>
  );
}

/* ─── EmailInput sub-component ──────────────────────────────── */
function EmailInput({ value, onChange, touched, onBlur }) {
  const result   = validateEmailFrontend(value);
  const showError = touched && value && !result.valid;
  const showOk    = touched && value &&  result.valid;

  const borderStyle = showError
    ? { borderColor: 'rgba(255,71,87,0.5)',   background: 'rgba(255,71,87,0.04)'  }
    : showOk
    ? { borderColor: 'rgba(37, 99, 235,0.5)',   background: 'rgba(37, 99, 235,0.04)' }
    : {};

  return (
    <div>
      <label className="label" style={{ display: 'block', marginBottom: 7 }}>Email address</label>
      <div style={{ position: 'relative' }}>
        <Mail
          size={15}
          style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: showError ? '#ff6b7a' : showOk ? '#2563eb' : 'var(--text-3)',
            transition: 'color 0.2s',
          }}
        />
        <input
          id="register-email"
          className="input"
          type="email"
          placeholder="you@gmail.com"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="email"
          required
          style={{ paddingLeft: 40, paddingRight: 36, ...borderStyle }}
        />
        {showOk && (
          <CheckCircle size={14} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#2563eb'
          }} />
        )}
        {showError && (
          <XCircle size={14} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#ff6b7a'
          }} />
        )}
      </div>
      {showError && (
        <p style={{ fontSize: 11, color: '#ff6b7a', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={10} /> {result.message}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGISTER COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({
    name: '', email: '', password: '', role: 'student', class: '', school: ''
  });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const emailResult    = validateEmailFrontend(form.email);
  const passwordResult = validatePasswordFrontend(form.password);
  const step1Valid     = form.name.trim().length >= 2 && emailResult.valid && passwordResult.valid;

  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

  const next = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!step1Valid) return;
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      if (data.devMode && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/onboarding');
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── password border style ── */
  const pwBorderStyle = () => {
    if (!touched.password || !form.password) return {};
    if (!passwordResult.valid) return { borderColor: 'rgba(255,71,87,0.5)', background: 'rgba(255,71,87,0.04)' };
    return { borderColor: 'rgba(37, 99, 235,0.5)', background: 'rgba(37, 99, 235,0.04)' };
  };

  /* ════════════════════════════════════════════════════════
     SUCCESS SCREEN
     ════════════════════════════════════════════════════════ */
  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
      >
        <AmbientBg />
        <div
          className="w-full fade-in-up"
          style={{ maxWidth: 420, position: 'relative', zIndex: 10 }}
        >
          <div
            style={{
              background: 'rgba(11,22,13,0.70)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid var(--border-md)',
              borderRadius: 24, padding: '3rem 2.5rem',
              boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(59, 130, 246,0.04)',
              textAlign: 'center',
            }}
          >
            {/* Animated mail icon */}
            <div
              className="float"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(37, 99, 235,0.18) 0%, rgba(59, 130, 246,0.08) 100%)',
                border: '2px solid rgba(37, 99, 235,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(37, 99, 235,0.20)',
              }}
            >
              <Mail size={30} style={{ color: '#3b82f6' }} />
            </div>

            <h2
              className="font-display"
              style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.01em' }}
            >
              Check your inbox! 📬
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>
              We sent a verification link to:
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', marginBottom: 16 }}>
              {form.email}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28, lineHeight: 1.6 }}>
              Click the link in the email to activate your account.
              The link expires in 24 hours.
            </p>
            <Link
              to="/login"
              className="btn-secondary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     REGISTRATION FORM
     ════════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
    >
      <AmbientBg />

      <div className="w-full fade-in-up" style={{ maxWidth: 420, position: 'relative', zIndex: 10 }}>

        {/* ── Logo + Title ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" className="inline-flex items-center gap-3 group" style={{ marginBottom: 24, display: 'inline-flex' }}>
            <div
              className="hover-lift"
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(37, 99, 235,0.22) 0%, rgba(59, 130, 246,0.10) 100%)',
                border: '1px solid rgba(37, 99, 235,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(37, 99, 235,0.18)', transition: 'all 0.25s ease',
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
            Create account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
            Join the eco movement
          </p>

          {/* ── Step progress pills ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                height: 5, width: 52, borderRadius: 99,
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                background: s <= step
                  ? 'linear-gradient(90deg, #2563eb, #3b82f6)'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: s <= step ? '0 0 8px rgba(59, 130, 246,0.4)' : 'none',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Step {step} of 2
          </p>
        </div>

        {/* ── Glassmorphic card ── */}
        <div
          style={{
            background: 'rgba(11,22,13,0.70)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--border-md)',
            borderRadius: 24, padding: '2.5rem',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(59, 130, 246,0.04)',
          }}
        >
          {/* Error banner */}
          {error && (
            <div
              className="fade-in"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: 13, color: '#ff6b7a',
                background: 'rgba(255,71,87,0.09)', border: '1px solid rgba(255,71,87,0.22)',
                borderRadius: 12, padding: '10px 14px', marginBottom: 20,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ════════════ STEP 1 ════════════ */}
          {step === 1 && (
            <form onSubmit={next} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>

              {/* Full Name */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 7 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-3)',
                  }} />
                  <input
                    id="register-name"
                    className="input"
                    placeholder="Arjun Sharma"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    minLength={2}
                    required
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              {/* Email */}
              <EmailInput
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                touched={touched.email}
                onBlur={() => handleBlur('email')}
              />

              {/* Password */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: touched.password && form.password && !passwordResult.valid ? '#ff6b7a' : 'var(--text-3)',
                    transition: 'color 0.2s',
                  }} />
                  <input
                    id="register-password"
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    style={{ paddingLeft: 40, paddingRight: 40, ...pwBorderStyle() }}
                  />
                  {/* show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: 'var(--text-3)', display: 'flex', alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--text-2)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {touched.password && form.password && !passwordResult.valid && (
                  <p style={{ fontSize: 11, color: '#ff6b7a', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={10} /> {passwordResult.message}
                  </p>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 10 }}>I am a…</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { r: 'student', icon: GraduationCap, label: 'Student' },
                    { r: 'teacher', icon: BookOpen,      label: 'Teacher' },
                  ].map(({ r, icon: Icon, label }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                        ...(form.role === r
                          ? {
                              background: 'rgba(37, 99, 235,0.15)',
                              border: '1px solid rgba(37, 99, 235,0.45)',
                              color: '#3b82f6',
                              boxShadow: '0 0 16px rgba(37, 99, 235,0.15)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--border-md)',
                              color: 'var(--text-2)',
                            }
                        ),
                      }}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue */}
              <button
                type="submit"
                className="btn-primary"
                disabled={!step1Valid}
                style={{
                  width: '100%', padding: '0.75rem', marginTop: 4,
                  fontSize: 15, fontWeight: 700,
                  opacity: step1Valid ? 1 : 0.45,
                  cursor: step1Valid ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ════════════ STEP 2 ════════════ */}
          {step === 2 && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Class — students only */}
              {form.role === 'student' && (
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 7 }}>Class / Grade</label>
                  <select
                    className="input"
                    value={form.class}
                    onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select Class</option>
                    {[
                      'Class 6','Class 7','Class 8','Class 9','Class 10',
                      'Class 11','Class 12',
                      'College Year 1','College Year 2','College Year 3',
                    ].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* School */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 7 }}>School / Institution</label>
                <input
                  className="input"
                  placeholder="ABC Public School"
                  value={form.school}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                  required
                />
              </div>

              {/* Back + Submit */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', fontSize: 14 }}
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.75rem', fontSize: 14, fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span style={{ marginLeft: 6 }}>Creating…</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            Have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--accent-b)', fontWeight: 600, textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--accent-b)'}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
