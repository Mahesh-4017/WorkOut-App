const mongoose = require('mongoose');

const weightEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weightKg: { type: Number, required: true, min: 20, max: 500 },
  recordedAt: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

weightEntrySchema.index({ user: 1, recordedAt: -1 });

module.exports = mongoose.model('WeightEntry', weightEntrySchema);
