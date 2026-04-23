const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { updateProgress } = require('../utils/userProgress');

const fs = require('fs');

// Ensure uploads/ directory always exists (fix for local dev & fresh clones)
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Sanitize filename — removes non-ASCII chars (Hindi, Chinese, etc.)
 * and replaces spaces/special chars with underscores.
 * Prevents ENOENT errors on Windows with unicode filenames.
 */
function sanitizeFilename(originalName) {
  const ext  = path.extname(originalName) || '';                   // .jpg, .pdf etc.
  const base = path.basename(originalName, ext)
    .replace(/[^\x00-\x7F]/g, '')   // strip non-ASCII (Hindi, emoji, etc.)
    .replace(/\s+/g, '_')            // spaces → underscores
    .replace(/[^a-zA-Z0-9_\-]/g, '') // remove remaining special chars
    .slice(0, 80)                     // max 80 chars
    || 'file';                        // fallback if name becomes empty
  return `${Date.now()}-${base}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
});
const IMAGE_MAX = 10 * 1024 * 1024; //  10 MB — images
const VIDEO_MAX = 50 * 1024 * 1024; //  50 MB — videos

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp)$/i;
const VIDEO_EXTS = /\.(mp4|mov|avi|mkv|webm|3gp)$/i;

const upload = multer({
  storage,
  // Set ceiling to video max; per-type enforcement is in fileFilter
  limits: { fileSize: VIDEO_MAX },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (IMAGE_EXTS.test(ext) || VIDEO_EXTS.test(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg/png/gif/webp) or video files (mp4/mov/avi/mkv/webm) are allowed'));
  },
});

// Get submissions (student: own; teacher: all pending)
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') filter.student = req.user.id;
    else if (req.query.status) filter.status = req.query.status;

    const subs = await Submission.find(filter)
      .populate('student', 'name class')
      .populate('task', 'title category xpReward')
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create submission (student)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    // Per-type size enforcement
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      if (IMAGE_EXTS.test(ext) && req.file.size > IMAGE_MAX) {
        fs.unlinkSync(req.file.path); // delete oversized file
        return res.status(400).json({ message: 'Image must be under 10 MB' });
      }
      if (VIDEO_EXTS.test(ext) && req.file.size > VIDEO_MAX) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Video must be under 50 MB' });
      }
    }

    const { taskId, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const sub = await Submission.create({
      student: req.user.id,
      task: taskId,
      description,
      imageUrl,
      status: 'pending',
    });

    // Notify the teacher who created this task
    const task = await Task.findById(taskId);
    if (task?.createdBy) {
      const student = await User.findById(req.user.id).select('name');
      await Notification.create({
        recipient: task.createdBy,
        sender: req.user.id,
        type: 'submission_received',
        message: `${student?.name || 'A student'} submitted "${task.title}"`,
        taskTitle: task.title,
      });
    }

    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher review submission
router.put('/:id/review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const { teacherScore, status } = req.body;

    const sub = await Submission.findById(req.params.id).populate('task');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    sub.teacherScore = teacherScore;
    sub.status = status;
    sub.reviewedBy = req.user.id;

    if (status === 'approved') {
      const xp = Math.round((teacherScore / 10) * sub.task.xpReward);
      sub.xpAwarded = xp;
      await User.findByIdAndUpdate(sub.student, { $inc: { xp } });
      await updateProgress(sub.student);
    }

    await sub.save();

    // Notify the student about review result
    const teacher = await User.findById(req.user.id).select('name');
    const notifType = status === 'approved' ? 'submission_approved' : 'submission_rejected';
    const xpMsg = status === 'approved' ? ` (+${sub.xpAwarded} XP)` : '';
    await Notification.create({
      recipient: sub.student,
      sender: req.user.id,
      type: notifType,
      message: `Your "${sub.task?.title}" submission was ${status} by ${teacher?.name || 'your teacher'}${xpMsg}`,
      taskTitle: sub.task?.title || '',
    });

    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
