import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Leaf, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'expired'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendState, setResendState] = useState('idle'); // 'idle' | 'sending' | 'sent'

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch(err => {
        const data = err.response?.data;
        if (data?.expired) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(data?.message || 'Verification failed. Please try again.');
      });
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendState('sending');
    try {
      await api.post('/auth/resend-verification', { email: resendEmail });
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Ambient radial glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: status === 'success'
            ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37, 99, 235,0.06), transparent)'
            : status === 'error'
            ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,71,87,0.06), transparent)'
            : status === 'expired'
            ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(251,191,36,0.06), transparent)'
            : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37, 99, 235,0.04), transparent)',
        }} />

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      <div className="w-full max-w-[400px] fade-in-up relative z-10">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(37, 99, 235,0.15)', border: '1px solid rgba(37, 99, 235,0.30)', boxShadow: '0 0 20px rgba(37, 99, 235,0.15)' }}>
            <Leaf size={20} style={{ color: '#3b82f6' }} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">EcoQuest</span>
        </Link>

        {/* Main card */}
        <div className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--card)',
            border: status === 'success'
              ? '1px solid rgba(37, 99, 235,0.25)'
              : status === 'error'
              ? '1px solid rgba(255,71,87,0.25)'
              : status === 'expired'
              ? '1px solid rgba(251,191,36,0.25)'
              : '1px solid var(--border-md)',
            boxShadow: status === 'success'
              ? '0 0 40px rgba(37, 99, 235,0.08)'
              : status === 'error'
              ? '0 0 40px rgba(255,71,87,0.08)'
              : 'none',
          }}>

          {/* ── Loading ── */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
                  style={{ borderColor: 'rgba(37, 99, 235,0.25)' }} />
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(37, 99, 235,0.10)', border: '1px solid rgba(37, 99, 235,0.25)' }}>
                  <Loader size={28} style={{ color: '#3b82f6' }} className="animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-[17px] font-bold mb-1">Verifying your email…</p>
                <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Please wait a moment</p>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(37, 99, 235,0.12)',
                    border: '2px solid rgba(37, 99, 235,0.35)',
                    boxShadow: '0 0 30px rgba(37, 99, 235,0.20)',
                  }}>
                  <CheckCircle size={36} style={{ color: '#3b82f6' }} />
                </div>
                {/* Ripple */}
                <div className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(37, 99, 235,0.08)', animationDuration: '2s' }} />
              </div>
              <div>
                <p className="font-display text-[20px] font-bold mb-1.5">Email Verified! 🎉</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>
              <Link to="/login"
                className="btn-primary w-full justify-center flex items-center gap-2"
                style={{ padding: '0.70rem' }}>
                Sign In Now <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,71,87,0.10)',
                  border: '2px solid rgba(255,71,87,0.30)',
                  boxShadow: '0 0 30px rgba(255,71,87,0.10)',
                }}>
                <XCircle size={36} style={{ color: '#ff4757' }} />
              </div>
              <div>
                <p className="font-display text-[20px] font-bold mb-1.5">Verification Failed</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>
              <Link to="/register" className="btn-secondary w-full justify-center flex items-center gap-2">
                <RefreshCw size={14} /> Register Again
              </Link>
            </div>
          )}

          {/* ── Expired — resend form ── */}
          {status === 'expired' && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(251,191,36,0.10)',
                  border: '2px solid rgba(251,191,36,0.30)',
                  boxShadow: '0 0 30px rgba(251,191,36,0.10)',
                }}>
                <Mail size={36} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="font-display text-[20px] font-bold mb-1.5">Link Expired</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>

              {resendState === 'sent' ? (
                <div className="w-full px-4 py-3.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2"
                  style={{ background: 'rgba(37, 99, 235,0.08)', border: '1px solid rgba(37, 99, 235,0.20)', color: '#3b82f6' }}>
                  <CheckCircle size={15} /> New link sent! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleResend} className="w-full space-y-3">
                  <input
                    type="email"
                    className="input"
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary w-full justify-center flex items-center gap-2"
                    disabled={resendState === 'sending'}>
                    {resendState === 'sending'
                      ? <><Loader size={14} className="animate-spin" /> Sending…</>
                      : <><Mail size={14} /> Resend Verification Email</>
                    }
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Back to login */}
        <p className="text-center mt-5 text-[13px]" style={{ color: 'var(--text-3)' }}>
          Already verified?{' '}
          <Link to="/login" style={{ color: '#3b82f6' }} className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
