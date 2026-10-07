const mongoose = require('mongoose');

const stepEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  steps: { type: Number, required: true, min: 0, max: 100000 },
  recordedAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

stepEntrySchema.index({ user: 1, recordedAt: -1 }, { unique: true });

module.exports = mongoose.model('StepEntry', stepEntrySchema);
