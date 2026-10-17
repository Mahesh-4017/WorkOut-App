const mongoose = require('mongoose');
const DailyPlan = require('../models/DailyPlan');
const { sendSuccess } = require('../utils/apiResponse');

const INDIA_TIMEZONE_OFFSET_MINUTES = 330;

function currentIndiaDate() {
  const indiaNow = new Date(Date.now() + INDIA_TIMEZONE_OFFSET_MINUTES * 60 * 1000);
  return indiaNow.toISOString().slice(0, 10);
}

function publicPlan(plan) {
  const { _id, user, __v, ...fields } = plan;
  return {
    id: String(_id),
    ...fields,
    repeatDays: fields.repeatDays || [],
    reminderEnabled: Boolean(fields.reminderEnabled)
  };
}

async function list(req, res) {
  const today = currentIndiaDate();
  const plans = await DailyPlan.find({
    user: req.appUser._id,
    $or: [
      { date: { $gte: today } },
      { repeatDays: { $exists: true, $ne: [] } }
    ]
  }).sort({ date: 1, time: 1 }).lean();
  return sendSuccess(res, 200, { items: plans.map(publicPlan) });
}

async function create(req, res) {
  const {
    title,
    description,
    date,
    time,
    repeatDays,
    reminderEnabled,
    reminderSoundUrl,
    reminderSoundTitle
  } = req.body;
  const today = currentIndiaDate();
  if (date < today) {
    return res.status(400).json({ success: false, message: 'Plans can only be scheduled for today or a future date' });
  }
  const plan = await DailyPlan.create({
    user: req.appUser._id,
    title,
    description: description || '',
    date,
    time,
    repeatDays: repeatDays || [],
    reminderSoundUrl,
    reminderSoundTitle,
    reminderEnabled: Boolean(reminderEnabled)
  });
  return sendSuccess(res, 201, { item: publicPlan(plan.toObject()) }, 'Day plan saved');
}

async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Planned activity not found' });
  }
  const plan = await DailyPlan.findOneAndDelete({ _id: req.params.id, user: req.appUser._id });
  if (!plan) return res.status(404).json({ success: false, message: 'Planned activity not found' });
  return sendSuccess(res, 200, { id: String(plan._id) }, 'Planned activity removed');
}

module.exports = { list, create, remove };
