const WorkoutSession = require('../models/WorkoutSession');
const FitnessGoal = require('../models/FitnessGoal');
const WeightEntry = require('../models/WeightEntry');
const StepEntry = require('../models/StepEntry');
const { sendSuccess } = require('../utils/apiResponse');

const ownedByUser = user => ({ user: user._id });

async function getProgress(req, res) {
  const userFilter = ownedByUser(req.appUser);
  const [sessions, goals, weightEntries, stepEntries] = await Promise.all([
    WorkoutSession.find(userFilter).sort({ startedAt: -1 }).limit(500).lean(),
    FitnessGoal.findOne(userFilter).lean(),
    WeightEntry.find(userFilter).sort({ recordedAt: -1 }).limit(365).lean(),
    StepEntry.find(userFilter).sort({ recordedAt: -1 }).limit(365).lean()
  ]);
  return sendSuccess(res, 200, {
    sessions: sessions.map(({ _id, user, __v, ...entry }) => ({ id: String(_id), ...entry })),
    goals: goals ? {
      weeklySessions: goals.weeklySessions,
      targetWeightKg: goals.targetWeightKg,
      dailySteps: goals.dailySteps,
      dailyCalories: goals.dailyCalories
    } : null,
    weightEntries: weightEntries.map(({ _id, user, __v, ...entry }) => ({ id: String(_id), ...entry })),
    stepEntries: stepEntries.map(({ _id, user, __v, ...entry }) => ({ id: String(_id), ...entry }))
  });
}

async function createSession(req, res) {
  let record;
  if (req.body.movesDone >= req.body.movesTotal && req.body.movesTotal > 0) {
    const [longest, highestCalories] = await Promise.all([
      WorkoutSession.findOne({ user: req.appUser._id, workoutId: req.body.workoutId }).sort({ seconds: -1 }).select('seconds').lean(),
      WorkoutSession.findOne({ user: req.appUser._id, workoutId: req.body.workoutId }).sort({ calories: -1 }).select('calories').lean()
    ]);
    if (longest && req.body.seconds > longest.seconds) record = 'Longest session for this workout';
    else if (highestCalories && req.body.calories > highestCalories.calories) record = 'Most calories burned in this workout';
  }
  const session = await WorkoutSession.create({ ...req.body, record, user: req.appUser._id });
  const { _id, user, __v, ...entry } = session.toObject();
  return sendSuccess(res, 201, { session: { id: String(_id), ...entry } }, 'Workout session saved');
}

async function updateFeedback(req, res) {
  const feedback = {};
  for (const field of ['rating', 'effort', 'feel', 'note']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) feedback[field] = req.body[field];
  }
  const session = await WorkoutSession.findOneAndUpdate(
    { _id: req.params.id, user: req.appUser._id },
    { $set: feedback },
    { new: true, runValidators: true }
  ).lean();
  if (!session) return res.status(404).json({ success: false, message: 'Workout session not found' });
  const { _id, user, __v, ...entry } = session;
  return sendSuccess(res, 200, { session: { id: String(_id), ...entry } }, 'Workout feedback saved');
}

async function saveGoals(req, res) {
  const update = {};
  const unset = {};
  for (const field of ['weeklySessions', 'targetWeightKg', 'dailySteps', 'dailyCalories']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      if (req.body[field] === null) unset[field] = 1;
      else update[field] = req.body[field];
    }
  }
  const updateDocument = { $set: update, $setOnInsert: { user: req.appUser._id } };
  if (Object.keys(unset).length) updateDocument.$unset = unset;
  const goals = await FitnessGoal.findOneAndUpdate(
    { user: req.appUser._id },
    updateDocument,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  return sendSuccess(res, 200, {
    goals: {
      weeklySessions: goals.weeklySessions,
      targetWeightKg: goals.targetWeightKg,
      dailySteps: goals.dailySteps,
      dailyCalories: goals.dailyCalories
    }
  }, 'Fitness goals saved');
}

async function addWeightEntry(req, res) {
  const entry = await WeightEntry.create({
    user: req.appUser._id,
    weightKg: req.body.weightKg,
    recordedAt: req.body.recordedAt || new Date()
  });
  const { _id, user, __v, ...data } = entry.toObject();
  return sendSuccess(res, 201, { entry: { id: String(_id), ...data } }, 'Weight entry saved');
}

async function addStepEntry(req, res) {
  const recordedAt = req.body.recordedAt ? new Date(req.body.recordedAt) : new Date();
  recordedAt.setUTCHours(0, 0, 0, 0);
  const entry = await StepEntry.findOneAndUpdate(
    { user: req.appUser._id, recordedAt },
    { $set: { steps: req.body.steps }, $setOnInsert: { user: req.appUser._id, recordedAt } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  const { _id, user, __v, ...data } = entry;
  return sendSuccess(res, 201, { entry: { id: String(_id), ...data } }, 'Step entry saved');
}

module.exports = {
  getProgress,
  createSession,
  updateFeedback,
  saveGoals,
  addWeightEntry,
  addStepEntry
};
