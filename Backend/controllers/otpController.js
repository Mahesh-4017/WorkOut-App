const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');
const { sendSuccess } = require('../utils/apiResponse');

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_INTERVAL_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;
const validPurposes = new Set(['verifyEmail', 'verifyPhone', 'resetPassword']);
let emailTransporter;

function normalizeTarget(purpose, target) {
  const value = String(target || '').trim();
  return purpose === 'verifyPhone' ? value.replace(/[\s()-]/g, '') : value.toLowerCase();
}

function findUserByEmail(target) {
  const email = String(target || '').trim().toLowerCase();
  return User.findOne({ email }).collation({ locale: 'en', strength: 2 });
}

function hashCode(purpose, target, code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  return crypto.createHmac('sha256', secret).update(`${purpose}:${target}:${code}`).digest('hex');
}

function matchesCode(challenge, code) {
  const expected = Buffer.from(challenge.codeHash, 'hex');
  const actual = Buffer.from(hashCode(challenge.purpose, challenge.target, code), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function deliverCode({ purpose, target, code }) {
  if (purpose !== 'verifyPhone') {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const error = new Error('Email OTP delivery is not configured on the server.');
      error.statusCode = 503;
      throw error;
    }

    if (!emailTransporter) {
      const auth = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS };
      emailTransporter = process.env.SMTP_HOST
        ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth
        })
        : nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth
        });
    }

    const subject = purpose === 'resetPassword'
      ? 'Your Velocity Health password reset code'
      : 'Verify your Velocity Health email';
    const text = `Your verification code is ${code}. It expires in 10 minutes. Do not share this code with anyone.`;
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: target,
      subject,
      text,
      html: `<p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>It expires in 10 minutes. Do not share this code with anyone.</p>`
    });
    return;
  }

  const url = process.env.OTP_SMS_WEBHOOK_URL;
  if (!url) {
    const error = new Error('SMS OTP delivery is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    const error = new Error('SMS OTP delivery must use HTTPS in production.');
    error.statusCode = 503;
    throw error;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.OTP_DELIVERY_TOKEN
        ? { Authorization: `Bearer ${process.env.OTP_DELIVERY_TOKEN}` }
        : {})
    },
    body: JSON.stringify({
      channel: 'sms',
      recipient: target,
      purpose,
      code,
      expiresInSeconds: OTP_LIFETIME_MS / 1000
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) {
    const error = new Error('The SMS delivery provider could not send the code.');
    error.statusCode = 502;
    throw error;
  }
}

async function send(req, res) {
  const { purpose } = req.body;
  const target = normalizeTarget(purpose, req.body.target);
  if (!validPurposes.has(purpose) || !target) {
    return res.status(422).json({ success: false, message: 'A valid OTP purpose and target are required.' });
  }
  if (purpose === 'verifyEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    return res.status(422).json({ success: false, message: 'A valid email address is required.' });
  }
  if (purpose === 'verifyPhone' && !/^\+?[1-9]\d{7,14}$/.test(target)) {
    return res.status(422).json({ success: false, message: 'A valid phone number is required.' });
  }

  try {
    const user = purpose === 'verifyPhone'
      ? await User.findOne({ phone: target })
      : await findUserByEmail(target);
    if (!user) {
      if (purpose === 'resetPassword') {
        return sendSuccess(res, 200, null, 'If an account exists, a code has been sent.');
      }
      return res.status(404).json({ success: false, message: 'No account matches that destination.' });
    }

    const now = new Date();
    const existing = await OtpChallenge.findOne({ userId: user._id, purpose });
    if (existing && now.getTime() - existing.sentAt.getTime() < RESEND_INTERVAL_MS) {
      return res.status(429).json({ success: false, message: 'Please wait before requesting another code.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const challenge = existing || new OtpChallenge({ userId: user._id, purpose });
    challenge.target = target;
    challenge.codeHash = hashCode(purpose, target, code);
    challenge.attempts = 0;
    challenge.sentAt = now;
    challenge.expiresAt = new Date(now.getTime() + OTP_LIFETIME_MS);
    challenge.verifiedAt = null;
    await challenge.save();

    try {
      await deliverCode({ purpose, target, code });
    } catch (error) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(error.statusCode || 502).json({
        success: false,
        message: error.statusCode === 503
          ? error.message
          : 'Unable to send the code right now. Please try again.'
      });
    }

    return sendSuccess(res, 200, null, 'Verification code sent.');
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to send the code right now.' });
  }
}

async function verify(req, res) {
  const { purpose, code } = req.body;
  const target = normalizeTarget(purpose, req.body.target);
  if (!validPurposes.has(purpose) || !target || !/^\d{6}$/.test(String(code || ''))) {
    return res.status(422).json({ success: false, message: 'A valid purpose, target, and 6-digit code are required.' });
  }

  try {
    const user = purpose === 'verifyPhone'
      ? await User.findOne({ phone: target })
      : await findUserByEmail(target);
    const challenge = user && await OtpChallenge.findOne({ userId: user._id, purpose, target });
    if (!challenge || challenge.expiresAt <= new Date()) {
      if (challenge) await challenge.deleteOne();
      return res.status(400).json({ success: false, message: 'This code is invalid or expired. Request a new one.' });
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
      await challenge.deleteOne();
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Request a new code.' });
    }
    if (!matchesCode(challenge, String(code))) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ success: false, message: 'That code is incorrect.' });
    }

    if (purpose === 'verifyEmail') {
      user.emailVerified = true;
      await user.save();
      await challenge.deleteOne();
    } else if (purpose === 'verifyPhone') {
      user.phoneVerified = true;
      await user.save();
      await challenge.deleteOne();
    } else {
      challenge.verifiedAt = new Date();
      await challenge.save();
    }
    return sendSuccess(res, 200, null, 'Code verified.');
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to verify the code right now.' });
  }
}

async function resetPassword(req, res) {
  const email = normalizeTarget('resetPassword', req.body.email);
  const { code, newPassword } = req.body;
  if (!email || !/^\d{6}$/.test(String(code || '')) || typeof newPassword !== 'string' || newPassword.length < 8 || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    return res.status(422).json({ success: false, message: 'Use a valid code and a password with at least 8 characters, a number, and a symbol.' });
  }

  try {
    const user = await findUserByEmail(email);
    const challenge = user && await OtpChallenge.findOne({ userId: user._id, purpose: 'resetPassword', target: email });
    if (!challenge || challenge.expiresAt <= new Date() || !challenge.verifiedAt || !matchesCode(challenge, String(code))) {
      return res.status(400).json({ success: false, message: 'Verify a current reset code before changing the password.' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    await challenge.deleteOne();
    return sendSuccess(res, 200, null, 'Password updated.');
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to reset the password right now.' });
  }
}

module.exports = { send, verify, resetPassword };
