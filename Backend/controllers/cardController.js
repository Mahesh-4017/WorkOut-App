const Card = require('../models/Card');
const { sendSuccess } = require('../utils/apiResponse');

async function listCards(req, res) {
  const { page = 1, limit = 10, search = '', status, category, audience, sort = '-createdAt' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (audience) filter.audience = audience;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }];
  const [items, total] = await Promise.all([
    Card.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
    Card.countDocuments(filter)
  ]);
  return sendSuccess(res, 200, { items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
}
async function getCard(req, res) {
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
  return sendSuccess(res, 200, card);
}
async function createCard(req, res) { return sendSuccess(res, 201, await Card.create(req.body), 'Card created'); }
async function updateCard(req, res) {
  const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
  return sendSuccess(res, 200, card, 'Card updated');
}
async function deleteCard(req, res) {
  const card = await Card.findByIdAndDelete(req.params.id);
  if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
  return sendSuccess(res, 200, null, 'Card deleted');
}
async function reorderCards(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(422).json({ success: false, message: 'items must be an array' });
  await Card.bulkWrite(items.map(({ id, order }) => ({ updateOne: { filter: { _id: id }, update: { order: Number(order) } } })));
  return sendSuccess(res, 200, null, 'Cards reordered');
}
async function publicCards(req, res) {
  const { page = 1, limit = 12, category, featured, gender } = req.query;
  const filter = { status: 'published', $or: [{ audience: { $in: gender ? [gender, 'all'] : ['all'] } }, { audience: { $exists: false } }] };
  if (category) filter.category = category;
  if (featured === 'true') filter.isFeatured = true;
  const [items, total] = await Promise.all([Card.find(filter).sort({ order: 1, createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)), Card.countDocuments(filter)]);
  return sendSuccess(res, 200, { items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
}
async function publicCard(req, res) {
  const gender = req.query.gender;
  const card = await Card.findOne({ _id: req.params.id, status: 'published', $or: [{ audience: { $in: gender ? [gender, 'all'] : ['all'] } }, { audience: { $exists: false } }] });
  if (!card) return res.status(404).json({ success: false, message: 'Published card not found' });
  return sendSuccess(res, 200, card);
}
module.exports = { listCards, getCard, createCard, updateCard, deleteCard, reorderCards, publicCards, publicCard };
