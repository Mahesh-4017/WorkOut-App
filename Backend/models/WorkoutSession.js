const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  workoutId: { type: String, required: true, trim: true, maxlength: 100 },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  startedAt: { type: Date, required: true },
  seconds: { type: Number, required: true, min: 0, max: 604800 },
  calories: { type: Number, required: true, min: 0, max: 100000 },
  distanceKm: { type: Number, required: true, min: 0, max: 10000 },
  movesDone: { type: Number, required: true, min: 0, max: 1000 },
  movesTotal: { type: Number, required: true, min: 0, max: 1000 },
  setsDone: { type: Number, required: true, min: 0, max: 10000 },
  record: { type: String, trim: true, maxlength: 120 },
  rating: { type: Number, min: 1, max: 5 },
  effort: { type: Number, min: 1, max: 5 },
  feel: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
  note: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

workoutSessionSchema.index({ user: 1, startedAt: -1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
