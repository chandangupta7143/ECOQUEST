import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Leaf, Mail } from 'lucide-react';
import api from '../api/axios';

export default function VerifyEmail() {
  const [params]  = useSearchParams();
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      <div className="w-full max-w-[380px] fade-in-up relative z-10 text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.30)' }}>
            <Leaf size={18} className="text-eco-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">EcoQuest</span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }}>

          {/* Loading */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader size={40} className="text-eco-400 animate-spin" />
              <p className="text-[15px] font-semibold">Verifying your email…</p>
              <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Please wait a moment</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.12)', border: '2px solid rgba(22,163,74,0.30)' }}>
                <CheckCircle size={32} className="text-eco-400" />
              </div>
              <div>
                <p className="text-[18px] font-bold mb-1">Email Verified! 🎉</p>
                <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>
              <Link to="/login" className="btn-primary w-full justify-center mt-2" style={{ padding: '0.65rem' }}>
                Sign In Now
              </Link>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.10)', border: '2px solid rgba(239,68,68,0.25)' }}>
                <XCircle size={32} className="text-red-400" />
              </div>
              <div>
                <p className="text-[18px] font-bold mb-1">Verification Failed</p>
                <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>
              <Link to="/register" className="btn-secondary w-full justify-center">
                Register Again
              </Link>
            </div>
          )}

          {/* Expired — show resend form */}
          {status === 'expired' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(234,179,8,0.10)', border: '2px solid rgba(234,179,8,0.25)' }}>
                <Mail size={32} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-[18px] font-bold mb-1">Link Expired</p>
                <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{message}</p>
              </div>

              {resendState === 'sent' ? (
                <div className="w-full px-4 py-3 rounded-xl text-[13px] text-center"
                  style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.20)', color: '#4ade80' }}>
                  ✅ New verification link sent! Check your inbox.
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
                  <button type="submit" className="btn-primary w-full justify-center" disabled={resendState === 'sending'}>
                    {resendState === 'sending' ? 'Sending…' : 'Resend Verification Email'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
