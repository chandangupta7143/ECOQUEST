const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, default: '' },
  class: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'url', 'video'], default: 'pdf' },
  fileUrl: { type: String, default: '' },
  fileOriginalName: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);
