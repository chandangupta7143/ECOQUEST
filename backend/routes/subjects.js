const router = require('express').Router();
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Note = require('../models/Note');

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create subject
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.create({ name: req.body.name, createdBy: req.user.id });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update subject name
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete subject (cascade: deactivate all quizzes & notes under it)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    // Deactivate all quizzes and notes linked to this subject's name
    await Quiz.updateMany({ subject: subject.name }, { isActive: false });
    await Note.updateMany({ subject: subject.name }, { isActive: false });
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add chapter
router.post('/:id/chapters', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.chapters.push({ name: req.body.name, order: subject.chapters.length });
    await subject.save();
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update chapter
router.put('/:id/chapters/:chid', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const ch = subject.chapters.id(req.params.chid);
    if (!ch) return res.status(404).json({ message: 'Chapter not found' });
    ch.name = req.body.name;
    await subject.save();
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete chapter (cascade: deactivate all quizzes & notes under it)
router.delete('/:id/chapters/:chid', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const chapter = subject.chapters.id(req.params.chid);
    if (chapter) {
      // Deactivate all quizzes & notes belonging to this chapter
      await Quiz.updateMany(
        { subject: subject.name, chapter: { $regex: new RegExp(`^${chapter.name}$`, 'i') } },
        { isActive: false }
      );
      await Note.updateMany(
        { subject: subject.name, chapter: { $regex: new RegExp(`^${chapter.name}$`, 'i') } },
        { isActive: false }
      );
    }
    subject.chapters = subject.chapters.filter(c => c._id.toString() !== req.params.chid);
    await subject.save();
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
