import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, School, BookOpen, Shield, Camera,
  Pencil, Check, X, ArrowLeft, Star, Flame, Trophy,
  Loader, AlertCircle, CheckCircle, Zap, Medal,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api, { fileUrl } from '../api/axios';

/* ─── class options ─────────────────────────────────────────────────────────── */
const CLASS_OPTIONS = [
  '', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'College Year 1', 'College Year 2', 'College Year 3',
];

/* ─── Avatar component ──────────────────────────────────────────────────────── */
function Avatar({ src, name, size = 96, editable = false, onEdit }) {
  const [hover, setHover] = useState(false);
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="relative inline-block cursor-pointer"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={editable ? onEdit : undefined}
    >
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          boxShadow: hover && editable
            ? '0 0 0 3px var(--accent), 0 0 24px rgba(37, 99, 235,0.50)'
            : '0 0 0 3px rgba(37, 99, 235,0.30), 0 0 16px rgba(37, 99, 235,0.20)',
          borderRadius: '50%',
        }} />

      {/* Avatar circle */}
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-white relative"
        style={{
          background: src ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #00664a 100%)',
          fontSize: size * 0.33,
        }}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : initials}

        {/* Hover overlay */}
        {editable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.55)',
              opacity: hover ? 1 : 0,
              backdropFilter: 'blur(2px)',
            }}>
            <Camera size={size * 0.22} className="text-white" />
            <span className="text-white font-semibold mt-1" style={{ fontSize: size * 0.11 }}>Change</span>
          </div>
        )}
      </div>

      {/* Camera badge (always visible when editable) */}
      {editable && (
        <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'var(--accent)', border: '2.5px solid var(--bg)' }}>
          <Camera size={12} className="text-black" />
        </div>
      )}
    </div>
  );
}

/* ─── Stat pill card ────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, glow }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all hover-lift"
      style={{
        background: 'var(--card)',
        border: `1px solid ${glow}`,
        boxShadow: `0 0 20px ${glow}40`,
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${glow}25`, border: `1px solid ${glow}` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="mono font-bold text-xl leading-none" style={{ color }}>{value}</p>
        <p className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Badge hex card ────────────────────────────────────────────────────────── */
function BadgeCard({ badge, index }) {
  const colors = [
    { glow: 'rgba(37, 99, 235,0.25)',  text: '#2563eb',  bg: 'rgba(37, 99, 235,0.10)'  },
    { glow: 'rgba(0,212,255,0.25)',  text: '#00d4ff',  bg: 'rgba(0,212,255,0.10)'  },
    { glow: 'rgba(251,191,36,0.25)', text: '#fbbf24',  bg: 'rgba(251,191,36,0.10)' },
    { glow: 'rgba(168,85,247,0.25)', text: '#a855f7',  bg: 'rgba(168,85,247,0.10)' },
    { glow: 'rgba(255,71,87,0.25)',  text: '#ff4757',  bg: 'rgba(255,71,87,0.10)'  },
  ];
  const c = colors[index % colors.length];

  return (
    <div className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover-lift text-center"
      style={{
        background: c.bg,
        border: `1px solid ${c.glow}`,
        boxShadow: `0 0 16px ${c.glow}50`,
      }}>
      <div className="text-2xl">🏅</div>
      <p className="text-[11px] font-semibold leading-tight" style={{ color: c.text }}>{badge}</p>
    </div>
  );
}

/* ─── Info row ──────────────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-md)' }}>
        <Icon size={13} style={{ color: 'var(--text-3)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="label">{label}</p>
        <p className="text-[14px] font-medium truncate mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate              = useNavigate();
  const fileInputRef          = useRef(null);

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [error,   setError]       = useState('');
  const [success, setSuccess]     = useState('');

  const [form, setForm]           = useState({ name: '', school: '', class: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);

  /* ── Load profile ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name || '', school: data.school || '', class: data.class || '' });
      })
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Avatar pick ───────────────────────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024)   { setError('Image must be under 10 MB.');   return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  /* ── Edit mode ─────────────────────────────────────────────────────────────── */
  const startEditing = () => {
    setForm({ name: profile.name || '', school: profile.school || '', class: profile.class || '' });
    setAvatarPreview(null);
    setAvatarFile(null);
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setError('');
  };

  /* ── Save ──────────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!form.name.trim()) { setError('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',   form.name.trim());
      fd.append('school', form.school.trim());
      fd.append('class',  form.class);
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await api.put('/users/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(data);
      setEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived ───────────────────────────────────────────────────────────────── */
  const avatarSrc = avatarPreview
    ? avatarPreview
    : profile?.avatar ? fileUrl(profile.avatar) : null;

  const isTeacher  = profile?.role === 'teacher';
  const roleBadge  = isTeacher
    ? { label: '👩‍🏫 Teacher', color: '#2563eb', bg: 'rgba(37, 99, 235,0.12)', border: 'rgba(37, 99, 235,0.30)' }
    : { label: '🎒 Student', color: '#00d4ff',  bg: 'rgba(0,212,255,0.12)',  border: 'rgba(0,212,255,0.30)' };

  const levelProgress = ((profile?.xp || 0) % 200) / 2; // rough progress-to-next-level %

  /* ── Loading ───────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(37, 99, 235,0.30)', borderTopColor: 'var(--accent)' }} />
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] p-4 md:p-6 pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">

            {/* ── Back button ─────────────────────────────────────────────── */}
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[13px] mb-6 transition-colors hover:text-white"
              style={{ color: 'var(--text-3)' }}>
              <ArrowLeft size={14} /> Back
            </button>

            {/* ── Alert banners ────────────────────────────────────────────── */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] text-red-400 mb-4 fade-in-up"
                style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.20)' }}>
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] mb-4 fade-in-up"
                style={{ background: 'rgba(37, 99, 235,0.08)', border: '1px solid rgba(37, 99, 235,0.22)', color: 'var(--accent)' }}>
                <CheckCircle size={14} className="shrink-0" /> {success}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                HERO BANNER
            ══════════════════════════════════════════════════════════════ */}
            <div className="relative rounded-3xl overflow-hidden mb-6 fade-in-up"
              style={{ border: '1px solid rgba(37, 99, 235,0.18)' }}>

              {/* Mesh gradient banner */}
              <div className="relative h-36 sm:h-44"
                style={{
                  background: `
                    radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235,0.28) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.18) 0%, transparent 55%),
                    radial-gradient(ellipse at 60% 80%, rgba(168,85,247,0.12) 0%, transparent 50%),
                    linear-gradient(135deg, #0d1117 0%, #111a14 100%)
                  `,
                }}>
                {/* Decorative dots pattern */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(37, 99, 235,0.6) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }} />

                {/* Ambient orbs */}
                <div className="absolute top-4 right-12 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.30) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-20 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(37, 99, 235,0.25) 0%, transparent 70%)' }} />

                {/* Edit / Save buttons — top right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {!editing ? (
                    <button onClick={startEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover-lift"
                      style={{ background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-2)', backdropFilter: 'blur(8px)' }}>
                      <Pencil size={11} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={cancelEditing} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                        style={{ background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-2)', backdropFilter: 'blur(8px)' }}>
                        <X size={11} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="btn-primary text-[12px]" style={{ padding: '0.4rem 1rem' }}>
                        {saving ? <Loader size={11} className="animate-spin" /> : <Check size={11} />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Avatar + Name row */}
              <div className="px-6 pb-6" style={{ background: 'var(--card)' }}>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">

                  {/* Avatar */}
                  <div className="shrink-0">
                    <input ref={fileInputRef} type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden" onChange={handleAvatarChange} />
                    <Avatar
                      src={avatarSrc}
                      name={profile?.name}
                      size={100}
                      editable={editing}
                      onEdit={() => fileInputRef.current?.click()} />
                    {editing && (
                      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-3)' }}>
                        Click to change · max 10 MB
                      </p>
                    )}
                  </div>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0 pb-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight truncate">
                      {profile?.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[12px] font-semibold px-3 py-1 rounded-full"
                        style={{ background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}` }}>
                        {roleBadge.label}
                      </span>
                      {profile?.isVerified && (
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(37, 99, 235,0.08)', color: 'var(--accent)', border: '1px solid rgba(37, 99, 235,0.20)' }}>
                          <CheckCircle size={10} /> Verified
                        </span>
                      )}
                      {profile?.school && (
                        <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                          🏫 {profile.school}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                STATS ROW
            ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard
                icon={Zap}
                label="Total XP"
                value={(profile?.xp ?? 0).toLocaleString()}
                color="#2563eb"
                glow="rgba(37, 99, 235,0.40)" />
              <StatCard
                icon={Trophy}
                label="Level"
                value={`Lv. ${profile?.level ?? 1}`}
                color="#fbbf24"
                glow="rgba(251,191,36,0.40)" />
              <StatCard
                icon={Flame}
                label="Day Streak"
                value={`${profile?.streak ?? 0}d`}
                color="#fb923c"
                glow="rgba(251,146,60,0.40)" />
              <StatCard
                icon={Medal}
                label="Badges"
                value={profile?.badges?.length ?? 0}
                color="#a855f7"
                glow="rgba(168,85,247,0.40)" />
            </div>

            {/* XP progress bar */}
            <div className="rounded-2xl px-5 py-4 mb-6"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-2)' }}>
                  Progress to Level {(profile?.level ?? 1) + 1}
                </span>
                <span className="mono text-[12px]" style={{ color: 'var(--accent)' }}>
                  {((profile?.xp || 0) % 200)}/200 XP
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill transition-all duration-700" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TWO-COLUMN LAYOUT
            ══════════════════════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* ── LEFT: Profile Details / Edit Form ──────────────────── */}
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }}>

                  {/* Card header */}
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="font-display font-bold text-[15px]">Profile Details</h2>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {editing ? 'Update your information below' : 'Your account information'}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    {!editing ? (
                      /* ── View mode ── */
                      <div className="space-y-0">
                        <InfoRow icon={Mail}    label="Email"  value={profile?.email} />
                        <InfoRow icon={School}  label="School" value={profile?.school} />
                        {!isTeacher && (
                          <InfoRow icon={BookOpen} label="Class" value={profile?.class} />
                        )}
                        <InfoRow icon={Shield}  label="Role"
                          value={isTeacher ? 'Teacher' : 'Student'} />
                        <InfoRow icon={User}    label="Joined"
                          value={profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : '—'} />
                      </div>
                    ) : (
                      /* ── Edit mode ── */
                      <div className="space-y-4">

                        {/* Name */}
                        <div>
                          <label className="label block mb-1.5">Full Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                          <div className="relative">
                            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                            <input className="input pl-9"
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                              placeholder="Your full name"
                              maxLength={80} />
                          </div>
                        </div>

                        {/* School */}
                        <div>
                          <label className="label block mb-1.5">School / Institution</label>
                          <div className="relative">
                            <School size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                            <input className="input pl-9"
                              value={form.school}
                              onChange={e => setForm({ ...form, school: e.target.value })}
                              placeholder="ABC Public School"
                              maxLength={120} />
                          </div>
                        </div>

                        {/* Class (students only) */}
                        {!isTeacher && (
                          <div>
                            <label className="label block mb-1.5">Class / Grade</label>
                            <div className="relative">
                              <BookOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                              <select className="input pl-9"
                                value={form.class}
                                onChange={e => setForm({ ...form, class: e.target.value })}>
                                {CLASS_OPTIONS.map(c => (
                                  <option key={c} value={c}>{c || 'Select Class'}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Save button (also in banner, but here for convenience) */}
                        <div className="flex gap-3 pt-2">
                          <button onClick={cancelEditing} disabled={saving}
                            className="btn-secondary flex-1 justify-center">
                            <X size={13} /> Cancel
                          </button>
                          <button onClick={handleSave} disabled={saving}
                            className="btn-primary flex-1 justify-center">
                            {saving
                              ? <><Loader size={13} className="animate-spin" /> Saving…</>
                              : <><Check size={13} /> Save Changes</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Badges + Activity ───────────────────────────── */}
              <div className="space-y-4">

                {/* Badges grid */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="font-display font-bold text-[15px]">Badges Earned</h2>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {profile?.badges?.length ?? 0} badge{(profile?.badges?.length ?? 0) !== 1 ? 's' : ''} collected
                    </p>
                  </div>

                  <div className="p-5">
                    {profile?.badges?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {profile.badges.map((badge, i) => (
                          <BadgeCard key={i} badge={badge} index={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                          <Medal size={20} style={{ color: 'rgba(168,85,247,0.50)' }} />
                        </div>
                        <p className="text-[13px] font-medium mb-1">No badges yet</p>
                        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                          Complete tasks to earn your first badge!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick stats card */}
                <div className="rounded-2xl p-5 space-y-3"
                  style={{ background: 'var(--card)', border: '1px solid var(--border-md)' }}>
                  <h3 className="font-display font-bold text-[14px] mb-4">Account Info</h3>

                  {[
                    { label: 'Member since', value: profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                        : '—' },
                    { label: 'Email',  value: profile?.email },
                    { label: 'Status', value: profile?.isVerified ? '✅ Verified' : '⏳ Unverified' },
                    ...(profile?.class ? [{ label: 'Class', value: profile.class }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>{label}</span>
                      <span className="text-[13px] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
