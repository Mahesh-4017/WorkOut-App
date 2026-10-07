const WorkoutExercise = require('../models/WorkoutExercise');
const { sendSuccess } = require('../utils/apiResponse');

function searchFilter(search) {
  if (!search) return {};
  const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(escaped, 'i');
  return { $or: [{ title: expression }, { description: expression }, { bodyPart: expression }, { category: expression }, { muscles: expression }, { equipment: expression }] };
}

async function listExercises(req, res, publicOnly = false) {
  const { page = 1, limit = 20, search = '', bodyPart, category, status, level, sort } = req.query;
  const filter = { ...searchFilter(search) };
  if (publicOnly) filter.status = 'published';
  if (bodyPart) filter.bodyPart = bodyPart;
  if (category) filter.category = category;
  if (status && !publicOnly) filter.status = status;
  if (level) filter.level = level;
  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const [items, total] = await Promise.all([
    WorkoutExercise.find(filter)
      .sort(publicOnly && sort === 'latest' ? { createdAt: -1, _id: -1 } : { order: 1, createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    WorkoutExercise.countDocuments(filter)
  ]);
  return sendSuccess(res, 200, { items, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
}

async function listPublicExercises(req, res) {
  return listExercises(req, res, true);
}

async function getExercise(req, res) {
  const exercise = await WorkoutExercise.findById(req.params.id).lean();
  if (!exercise) return res.status(404).json({ success: false, message: 'Workout exercise not found' });
  return sendSuccess(res, 200, exercise);
}

async function getPublicExercise(req, res) {
  const exercise = await WorkoutExercise.findOne({ _id: req.params.id, status: 'published' }).lean();
  if (!exercise) return res.status(404).json({ success: false, message: 'Published workout exercise not found' });
  return sendSuccess(res, 200, exercise);
}

async function listBodyParts(req, res) {
  const exercises = await WorkoutExercise.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: { bodyPart: '$bodyPart', category: '$category' }, count: { $sum: 1 }, imageUrl: { $max: '$imageUrl' } } },
    { $sort: { '_id.bodyPart': 1, '_id.category': 1 } },
    { $group: { _id: '$_id.bodyPart', count: { $sum: '$count' }, imageUrl: { $max: '$imageUrl' }, categories: { $push: { name: '$_id.category', count: '$count' } } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, name: '$_id', count: 1, imageUrl: 1, categories: 1 } }
  ]);
  return sendSuccess(res, 200, exercises);
}

async function createExercise(req, res) {
  const exercise = await WorkoutExercise.create(req.body);
  return sendSuccess(res, 201, exercise, 'Workout exercise created');
}

async function updateExercise(req, res) {
  const exercise = await WorkoutExercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exercise) return res.status(404).json({ success: false, message: 'Workout exercise not found' });
  return sendSuccess(res, 200, exercise, 'Workout exercise updated');
}

async function deleteExercise(req, res) {
  const exercise = await WorkoutExercise.findByIdAndDelete(req.params.id);
  if (!exercise) return res.status(404).json({ success: false, message: 'Workout exercise not found' });
  return sendSuccess(res, 200, null, 'Workout exercise deleted');
}

module.exports = {
  listExercises,
  listPublicExercises,
  getExercise,
  getPublicExercise,
  listBodyParts,
  createExercise,
  updateExercise,
  deleteExercise
};
