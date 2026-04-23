const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const auth    = require('../middleware/auth');
const User    = require('../models/User');

// ── Uploads dir (same as submissions/notes) ──────────────────
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function sanitizeFilename(prefix, originalName) {
  const ext  = path.extname(originalName) || '';
  const base = path.basename(originalName, ext)
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .slice(0, 60) || 'avatar';
  return `${prefix}-${Date.now()}-${base}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => cb(null, sanitizeFilename('avatar', file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max for profile pics
  fileFilter: (req, file, cb) => {
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(path.extname(file.originalname))) {
      return cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
    }
    cb(null, true);
  },
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/me — current user profile
// ─────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken -verificationTokenExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/users/me — update profile (text fields + optional image)
// ─────────────────────────────────────────────────────────────
router.put('/me', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, class: userClass, school, interests, ecoLevel } = req.body;

    const update = {};
    if (name      !== undefined && name.trim())  update.name      = name.trim();
    if (userClass !== undefined) update.class    = userClass;
    if (school    !== undefined) update.school   = school.trim();
    if (interests !== undefined) update.interests = Array.isArray(interests)
      ? interests
      : JSON.parse(interests || '[]');
    if (ecoLevel  !== undefined) update.ecoLevel = ecoLevel;

    // If a new avatar was uploaded, save path and delete old one
    if (req.file) {
      const newPath = `/uploads/${req.file.filename}`;

      // Delete old avatar from disk (if it's a local upload, not a URL)
      const existingUser = await User.findById(req.user.id).select('avatar');
      if (existingUser?.avatar?.startsWith('/uploads/')) {
        const oldFile = path.join(__dirname, '..', existingUser.avatar);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      update.avatar = newPath;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true }
    ).select('-password -verificationToken -verificationTokenExpiry');

    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/users/students — all students (teacher only)
// ─────────────────────────────────────────────────────────────
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const students = await User.find({ role: 'student' })
      .select('-password -verificationToken -verificationTokenExpiry')
      .sort({ xp: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
