const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctIndex: Number,
  explanation: String,
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  class: { type: String, required: true },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  xpReward: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);
