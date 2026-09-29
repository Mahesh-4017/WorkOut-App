const Card = require('../models/Card');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
async function stats(req, res) {
  const [total, published, drafts, featured, recent, userTotal, maleUsers, femaleUsers, recentUsers] = await Promise.all([
    Card.countDocuments(), Card.countDocuments({ status: 'published' }), Card.countDocuments({ status: 'draft' }), Card.countDocuments({ isFeatured: true }), Card.find().sort('-createdAt').limit(5),
    User.countDocuments(), User.countDocuments({ gender: 'male' }), User.countDocuments({ gender: 'female' }), User.find().select('name email gender createdAt lastLoginAt loginCount').sort('-createdAt').limit(20).lean()
  ]);
  return sendSuccess(res, 200, { total, published, drafts, featured, recent, users: { total: userTotal, male: maleUsers, female: femaleUsers, recent: recentUsers } });
}
module.exports = { stats };
