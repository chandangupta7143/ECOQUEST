import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Leaf, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { validateEmail } from '../utils/validateEmail';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendState, setResendState] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotVerified(false);

    // Frontend guard — block invalid TLD before even hitting backend
    const check = validateEmail(form.email);
    if (!check.valid) {
      setEmailError(check.reason);
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

  const handleResend = async () => {
    setResendState('sending');
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      <div className="w-full max-w-[360px] fade-in-up relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.30)' }}>
              <Leaf size={18} className="text-eco-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">EcoQuest</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-[14px]" style={{ color: 'var(--text-2)' }}>Sign in to continue your journey</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }}>

          {/* Standard error */}
          {error && !notVerified && (
            <div className="flex items-center gap-2 text-[13px] text-red-400 px-3 py-2.5 rounded-lg mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}

          {/* Not-verified banner with resend button */}
          {notVerified && (
            <div className="px-3.5 py-3 rounded-xl mb-4 space-y-2"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.22)' }}>
              <p className="text-[13px] text-yellow-400 flex items-start gap-2">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>Email not verified. Check your inbox or resend the link below.</span>
              </p>
              {resendState === 'sent' ? (
                <p className="text-[12px] text-eco-400 pl-5">✅ New link sent! Check your inbox.</p>
              ) : (
                <button onClick={handleResend} disabled={resendState === 'sending'}
                  className="ml-5 flex items-center gap-1.5 text-[12px] text-yellow-300 hover:text-yellow-100 transition-colors"
                >
                  <RefreshCw size={11} className={resendState === 'sending' ? 'animate-spin' : ''} />
                  {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                <input id="login-email" className={`input pl-9 ${emailError ? 'border-red-500/50' : ''}`}
                  type="email" placeholder="you@gmail.com"
                  value={form.email}
                  onChange={e => {
                    const val = e.target.value;
                    setForm({ ...form, email: val });
                    if (val.includes('@')) {
                      const chk = validateEmail(val);
                      setEmailError(chk.valid ? '' : chk.reason);
                    } else {
                      setEmailError('');
                    }
                  }}
                  autoComplete="email" required />
                {emailError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {emailError}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                <input id="login-password" className="input pl-9" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password" required />
              </div>
            </div>

            <button type="submit" id="login-submit" disabled={loading}
              className="w-full btn-primary justify-center mt-1" style={{ padding: '0.65rem' }}>
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-[12px] mt-4" style={{ color: 'var(--text-3)' }}>
            No account?{' '}
            <Link to="/register" className="text-white/70 hover:text-white transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
