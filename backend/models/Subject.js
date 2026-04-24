const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const subjectSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  class:     { type: String, default: '' },          // e.g. "Class 9"
  chapters:  [chapterSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Subject', subjectSchema);
