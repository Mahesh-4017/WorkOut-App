const mongoose = require('mongoose');

const plannedWorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutExercise' },
  classId: { type: String, trim: true, maxlength: 100 },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  bodyPart: { type: String, trim: true, maxlength: 80, default: '' },
  category: { type: String, trim: true, maxlength: 80, default: '' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  durationMinutes: { type: Number, min: 1, max: 600, default: 30 }
}, { timestamps: true });

plannedWorkoutSchema.index({ user: 1, date: 1, time: 1 });

module.exports = mongoose.model('PlannedWorkout', plannedWorkoutSchema);
