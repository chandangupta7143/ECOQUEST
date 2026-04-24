const router = require('express').Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const { updateProgress } = require('../utils/userProgress');

// Get quizzes (optionally filter by class/subject)
router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };
    // Only apply class filter when a non-empty value is provided
    if (req.query.class && req.query.class.trim()) filter.class = req.query.class.trim();
    if (req.query.subject && req.query.subject.trim()) filter.subject = req.query.subject.trim();
    const quizzes = await Quiz.find(filter).populate('createdBy', 'name');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create quiz (teacher only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quiz (teacher only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete quiz (teacher only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
    await Quiz.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Quiz deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit quiz answers (student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers } = req.body; // array of selected indices
    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { question: q.question, isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const xpEarned = Math.round((score / 100) * quiz.xpReward);

    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpEarned } });
    await QuizAttempt.create({ student: req.user.id, quiz: quiz._id, score, xpEarned, correct, total: quiz.questions.length });
    await updateProgress(req.user.id);

    res.json({ score, correct, total: quiz.questions.length, xpEarned, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
