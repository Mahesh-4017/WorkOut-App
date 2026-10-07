const mongoose = require('mongoose');
const PlannedWorkout = require('../models/PlannedWorkout');
const WorkoutExercise = require('../models/WorkoutExercise');
const { sendSuccess } = require('../utils/apiResponse');

function publicPlan(plan) {
  const { _id, user, __v, ...fields } = plan;
  return { id: String(_id), ...fields };
}

async function list(req, res) {
  const plans = await PlannedWorkout.find({ user: req.appUser._id }).sort({ date: 1, time: 1 }).lean();
  return sendSuccess(res, 200, { items: plans.map(publicPlan) });
}

async function create(req, res) {
  const { exerciseId, classId, title, bodyPart, category, date, time, durationMinutes } = req.body;
  if (exerciseId) {
    const exists = await WorkoutExercise.exists({ _id: exerciseId, status: 'published' });
    if (!exists) return res.status(404).json({ success: false, message: 'Published exercise not found' });
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
    durationMinutes: durationMinutes || 30
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
