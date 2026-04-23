const router = require('express').Router();
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');

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

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
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

// Delete chapter
router.delete('/:id/chapters/:chid', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.chapters = subject.chapters.filter(c => c._id.toString() !== req.params.chid);
    await subject.save();
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
