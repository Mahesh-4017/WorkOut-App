const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), type: 'app-user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

function authData(user) {
  return { token: issueToken(user), user: user.toPublic() };
}

async function register(req, res) {
  const { name, email, password, gender, age, height, weight, goal } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, gender, age, height, weight, goal });
  return sendSuccess(res, 201, authData(user), 'Account created');
}

async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save();
  return sendSuccess(res, 200, authData(user), 'Logged in');
}

async function me(req, res) { return sendSuccess(res, 200, { user: req.appUser.toPublic() }); }

async function updateProfile(req, res) {
  const allowed = ['name', 'gender', 'age', 'height', 'weight', 'goal'];
  allowed.forEach(field => { if (req.body[field] !== undefined) req.appUser[field] = req.body[field]; });
  await req.appUser.save();
  return sendSuccess(res, 200, { user: req.appUser.toPublic() }, 'Profile updated');
}

module.exports = { register, login, me, updateProfile };
