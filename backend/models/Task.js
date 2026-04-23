const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['waste', 'water', 'energy', 'cleanliness', 'plantation'],
    required: true,
  },
  type: { type: String, enum: ['daily', 'weekly', 'mission'], default: 'daily' },
  xpReward: { type: Number, default: 50 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);
