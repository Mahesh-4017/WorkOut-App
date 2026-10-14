const mongoose = require('mongoose');

const fitnessGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weeklySessions: { type: Number, min: 1, max: 21 },
  targetWeightKg: { type: Number, min: 20, max: 500 },
  dailySteps: { type: Number, min: 1, max: 100000 },
  dailyStepsReminderTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  dailyCalories: { type: Number, min: 1, max: 100000 }
}, { timestamps: true });

module.exports = mongoose.model('FitnessGoal', fitnessGoalSchema);
