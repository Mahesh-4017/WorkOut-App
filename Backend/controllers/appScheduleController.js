const mongoose = require('mongoose');
const PlannedWorkout = require('../models/PlannedWorkout');
const { sendSuccess } = require('../utils/apiResponse');

function currentDateForOffset(offsetMinutes = 0) {
  const localNow = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return localNow.toISOString().slice(0, 10);
}

function publicPlan(plan) {
  const { _id, user, __v, ...fields } = plan;
  return {
    id: String(_id),
    ...fields,
    repeatDays: fields.repeatDays || [],
    repeatDates: fields.repeatDates || [],
    reminderTime: fields.reminderTime || fields.time,
    reminderEnabled: Boolean(fields.reminderEnabled)
  };
}

async function list(req, res) {
  const offset = Number(req.query.timezoneOffsetMinutes || 0);
  const today = currentDateForOffset(offset);
  const plans = await PlannedWorkout.find({
    user: req.appUser._id,
    $or: [
      { date: { $gte: today } },
      { repeatDays: { $exists: true, $ne: [] } },
      { repeatDates: { $elemMatch: { $gte: today } } }
    ]
  }).sort({ date: 1, time: 1 }).lean();
  return sendSuccess(res, 200, { items: plans.map(publicPlan) });
}

async function create(req, res) {
  const {
    exerciseId, classId, title, bodyPart, category, date, time,
    durationMinutes, repeatDays, repeatDates, reminderTime, reminderSoundUrl, reminderSoundTitle, reminderEnabled
  } = req.body;
  if (!exerciseId && !classId && !bodyPart?.trim()) {
    return res.status(400).json({ success: false, message: 'Choose a body part to schedule' });
  }
  const today = currentDateForOffset(Number(req.body.timezoneOffsetMinutes || 0));
  if (date < today || (repeatDates || []).some(selectedDate => selectedDate < today)) {
    return res.status(400).json({ success: false, message: 'Workouts can only be scheduled for today or a future date' });
  }
  if (repeatDates && repeatDates.length > 30) {
    return res.status(400).json({ success: false, message: 'Choose no more than 30 specific workout dates' });
  }
  const plan = await PlannedWorkout.create({
    user: req.appUser._id,
    exerciseId: exerciseId || undefined,
    classId: classId || undefined,
    title,
    bodyPart: bodyPart || '',
    category: category || '',
    date,
    time,
    durationMinutes: durationMinutes || 30,
    repeatDays: repeatDays || [],
    repeatDates: repeatDates || [],
    reminderTime: reminderTime || time,
    reminderSoundUrl: reminderSoundUrl || undefined,
    reminderSoundTitle: reminderSoundTitle || undefined,
    reminderEnabled: Boolean(reminderEnabled)
  });
  return sendSuccess(res, 201, { item: publicPlan(plan.toObject()) }, 'Workout scheduled');
}

async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Scheduled workout not found' });
  }
  const plan = await PlannedWorkout.findOneAndDelete({ _id: req.params.id, user: req.appUser._id });
  if (!plan) return res.status(404).json({ success: false, message: 'Scheduled workout not found' });
  return sendSuccess(res, 200, { id: String(plan._id) }, 'Scheduled workout removed');
}

module.exports = { list, create, remove };
