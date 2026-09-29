const SiteSettings = require('../models/SiteSettings');
const { sendSuccess } = require('../utils/apiResponse');
async function getSettings(req, res) { return sendSuccess(res, 200, await SiteSettings.findOne({ key: 'default' }).lean() || {}); }
async function updateSettings(req, res) { return sendSuccess(res, 200, await SiteSettings.findOneAndUpdate({ key: 'default' }, { ...req.body, key: 'default' }, { upsert: true, new: true, runValidators: true }), 'Settings updated'); }
module.exports = { getSettings, updateSettings };
