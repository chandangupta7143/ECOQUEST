const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  xpEarned: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
