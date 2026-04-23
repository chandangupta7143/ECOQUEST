const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  teacherScore: { type: Number, default: null },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  xpAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema);
