const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 3000, default: '' },
  bodyPart: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  muscles: { type: [String], default: [] },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  durationMinutes: { type: Number, min: 1, max: 600, default: 10 },
  equipment: { type: [String], default: [] },
  imageUrl: { type: String, trim: true, default: '' },
  videoUrl: { type: String, required: true, trim: true },
  instructions: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

workoutExerciseSchema.index({ status: 1, bodyPart: 1, category: 1, order: 1 });

module.exports = mongoose.model('WorkoutExercise', workoutExerciseSchema);
