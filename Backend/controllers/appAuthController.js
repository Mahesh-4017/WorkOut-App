const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { isEmailConfigured, sendPasswordResetEmail } = require('../utils/email');

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

async function requestPasswordReset(req, res) {
  if (!isEmailConfigured()) {
    return res.status(503).json({ success: false, message: 'Password reset email is not configured on the server' });
  }

  const email = req.body.email.toLowerCase().trim();
  const user = await User.findOne({ email });
  const message = 'If an account exists for that email, a reset link has been sent.';
  if (!user) return sendSuccess(res, 200, null, message);

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const publicUrl = (process.env.PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000').replace(/\/$/, '');
  const resetUrl = `${publicUrl}/reset-password.html?token=${encodeURIComponent(token)}`;
  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    throw error;
  }

  return sendSuccess(res, 200, null, message);
}

async function resetPassword(req, res) {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.findOneAndUpdate(
    { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
    { $set: { passwordHash }, $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } },
    { new: true }
  );
  if (!user) return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired. Request a new one.' });
  return sendSuccess(res, 200, null, 'Password updated. You can now log in.');
}

module.exports = { register, login, me, updateProfile, requestPasswordReset, resetPassword };
