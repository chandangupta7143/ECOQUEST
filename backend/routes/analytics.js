const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Submission = require('../models/Submission');
const QuizAttempt = require('../models/QuizAttempt');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');

// Student analytics
router.get('/student', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await User.findById(studentId).select('-password');

    const submissions = await Submission.find({ student: studentId })
      .populate('task', 'title category xpReward')
      .sort({ createdAt: -1 });

    const attempts = await QuizAttempt.find({ student: studentId })
      .populate('quiz', 'title subject')
      .sort({ createdAt: -1 });

    // XP per day (last 14 days)
    const xpByDay = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      xpByDay[d.toISOString().split('T')[0]] = 0;
    }
    submissions.filter((s) => s.status === 'approved').forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      if (xpByDay[day] !== undefined) xpByDay[day] += s.xpAwarded || 0;
    });
    attempts.forEach((a) => {
      const day = new Date(a.createdAt).toISOString().split('T')[0];
      if (xpByDay[day] !== undefined) xpByDay[day] += a.xpEarned || 0;
    });
    const xpChart = Object.entries(xpByDay).map(([date, xp]) => ({
      date: date.slice(5), xp,
    }));

    // Category mastery
    const categories = ['waste', 'water', 'energy', 'cleanliness', 'plantation'];
    const categoryStats = {};
    categories.forEach((c) => {
      const total = submissions.filter((s) => s.task?.category === c).length;
      const approved = submissions.filter((s) => s.task?.category === c && s.status === 'approved').length;
      categoryStats[c] = total > 0 ? Math.round((approved / total) * 100) : 0;
    });

    // Category distribution
    const categoryDist = categories.map((c) => ({
      name: c,
      value: submissions.filter((s) => s.task?.category === c).length,
    })).filter((c) => c.value > 0);

    res.json({
      user,
      totalSubmissions: submissions.length,
      approvedSubmissions: submissions.filter((s) => s.status === 'approved').length,
      pendingSubmissions: submissions.filter((s) => s.status === 'pending').length,
      totalQuizAttempts: attempts.length,
      avgQuizScore: attempts.length ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0,
      xpChart,
      categoryStats,
      categoryDist,
      recentSubmissions: submissions.slice(0, 5),
      recentAttempts: attempts.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher analytics
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

    const students = await User.find({ role: 'student' }).select('-password').sort({ xp: -1 });
    const submissions = await Submission.find()
      .populate('student', 'name class')
      .populate('task', 'title category xpReward')
      .sort({ createdAt: -1 });

    const tasks = await Task.find({ isActive: true });
    const quizzes = await Quiz.find({ isActive: true });
    const attempts = await QuizAttempt.find().populate('student', 'name');

    // Submissions per day (last 14 days)
    const submsByDay = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      submsByDay[d.toISOString().split('T')[0]] = 0;
    }
    submissions.forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      if (submsByDay[day] !== undefined) submsByDay[day]++;
    });
    const activityChart = Object.entries(submsByDay).map(([date, count]) => ({
      date: date.slice(5), count,
    }));

    // Category distribution
    const categories = ['waste', 'water', 'energy', 'cleanliness', 'plantation'];
    const categoryDist = categories.map((c) => ({
      name: c,
      value: submissions.filter((s) => s.task?.category === c).length,
    })).filter((c) => c.value > 0);

    // Status breakdown
    const statusDist = [
      { name: 'Approved', value: submissions.filter((s) => s.status === 'approved').length },
      { name: 'Pending', value: submissions.filter((s) => s.status === 'pending').length },
      { name: 'Rejected', value: submissions.filter((s) => s.status === 'rejected').length },
    ].filter((s) => s.value > 0);

    res.json({
      totalStudents: students.length,
      totalSubmissions: submissions.length,
      pendingReviews: submissions.filter((s) => s.status === 'pending').length,
      approvedCount: submissions.filter((s) => s.status === 'approved').length,
      totalTasks: tasks.length,
      totalQuizzes: quizzes.length,
      avgXP: students.length ? Math.round(students.reduce((a, s) => a + s.xp, 0) / students.length) : 0,
      topStudents: students.slice(0, 10),
      activityChart,
      categoryDist,
      statusDist,
      recentSubmissions: submissions.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
