const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const googleClient = new OAuth2Client();

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), type: 'app-user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

function authData(user) {
  return { token: issueToken(user), user: user.toPublic() };
}

async function register(req, res) {
  const { name, email, password, phone, gender, age, height, weight, goal } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedPhone = typeof phone === 'string' && phone.trim() ? phone.trim().replace(/[\s()-]/g, '') : undefined;
  if (normalizedPhone && await User.findOne({ phone: normalizedPhone })) {
    return res.status(409).json({ success: false, message: 'An account with this phone number already exists' });
  }
  const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: normalizedPhone, passwordHash, authProviders: ['password'], gender, age, height, weight, goal });
  return sendSuccess(res, 201, authData(user), 'Account created');
}

async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
  if (!user || !user.passwordHash || !(await bcrypt.compare(req.body.password, user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save();
  return sendSuccess(res, 200, authData(user), 'Logged in');
}

async function loginWithGoogle(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(503).json({ success: false, message: 'Google sign-in is not configured on the server' });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: req.body.idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid Google sign-in token' });
  }

  if (!payload?.email || payload.email_verified !== true) {
    return res.status(401).json({ success: false, message: 'A verified Google email is required' });
  }

  const email = payload.email.toLowerCase().trim();
  const name = (payload.name || email.split('@')[0]).trim().slice(0, 100);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: { lastLoginAt: new Date() },
      $setOnInsert: { name, email, gender: '', goal: '' },
      $inc: { loginCount: 1 },
      $addToSet: { authProviders: 'google' }
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: false }
  );
  return sendSuccess(res, 200, authData(user), 'Logged in with Google');
}

async function loginWithApple(req, res) {
  const audiences = (process.env.APPLE_CLIENT_IDS || '').split(',').map(value => value.trim()).filter(Boolean);
  if (!audiences.length) return res.status(503).json({ success: false, message: 'Apple sign-in is not configured on the server' });

  let payload;
  try {
    const nonce = crypto.createHash('sha256').update(req.body.nonce).digest('hex');
    payload = await appleSignin.verifyIdToken(req.body.idToken, { audience: audiences, nonce });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid Apple sign-in token' });
  }

  if (!payload.sub) return res.status(401).json({ success: false, message: 'Apple user ID is missing' });
  let user = await User.findOne({ appleSubject: payload.sub });

  if (user) {
    if (!user.authProviders.includes('apple')) user.authProviders.push('apple');
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();
  } else {
    const email = payload.email?.toLowerCase().trim();
    if (!email || ![true, 'true'].includes(payload.email_verified)) {
      return res.status(401).json({ success: false, message: 'A verified Apple email is required for the first sign-in' });
    }

    const providedName = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 100) : '';
    const name = providedName || email.split('@')[0];
    user = await User.findOne({ email });
    if (user) {
    user.appleSubject = payload.sub;
      if (!user.authProviders.includes('apple')) user.authProviders.push('apple');
      user.lastLoginAt = new Date();
      user.loginCount += 1;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        appleSubject: payload.sub,
        authProviders: ['apple'],
        lastLoginAt: new Date(),
        loginCount: 1
      });
    }
  }

  return sendSuccess(res, 200, authData(user), 'Logged in with Apple');
}

async function me(req, res) { return sendSuccess(res, 200, { user: req.appUser.toPublic() }); }

async function updateProfile(req, res) {
  const allowed = ['name', 'gender', 'age', 'height', 'weight', 'goal'];
  allowed.forEach(field => { if (req.body[field] !== undefined) req.appUser[field] = req.body[field]; });
  await req.appUser.save();
  return sendSuccess(res, 200, { user: req.appUser.toPublic() }, 'Profile updated');
}

module.exports = { register, login, loginWithGoogle, loginWithApple, me, updateProfile };
