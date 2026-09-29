const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendSuccess } = require('../utils/apiResponse');

const cookieOptions = () => ({ httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
const signToken = (admin) => jwt.sign({ sub: admin._id.toString(), email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

async function login(req, res) {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  if (admin.lockedUntil && admin.lockedUntil > new Date()) return res.status(423).json({ success: false, message: 'Account temporarily locked. Try again later.' });
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();
    return res.status(admin.lockedUntil ? 423 : 401).json({ success: false, message: admin.lockedUntil ? 'Account locked for 15 minutes' : 'Invalid email or password' });
  }
  admin.failedLoginAttempts = 0;
  admin.lockedUntil = null;
  await admin.save();
  res.cookie('admin_token', signToken(admin), cookieOptions());
  return sendSuccess(res, 200, { admin: { id: admin._id, email: admin.email } }, 'Logged in');
}

async function me(req, res) { return sendSuccess(res, 200, { admin: { id: req.admin._id, email: req.admin.email } }); }
async function logout(req, res) { res.clearCookie('admin_token', cookieOptions()); return sendSuccess(res, 200, null, 'Logged out'); }
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id);
  if (!await bcrypt.compare(currentPassword, admin.passwordHash)) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 10) return res.status(422).json({ success: false, message: 'New password must be at least 10 characters' });
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();
  return sendSuccess(res, 200, null, 'Password changed. Please log in again.');
}

module.exports = { login, me, logout, changePassword };
