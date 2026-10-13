const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  repeatDays: { type: [Number], default: [] },
  reminderEnabled: { type: Boolean, default: false }
}, { timestamps: true });

dailyPlanSchema.index({ user: 1, date: 1, time: 1 });

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
