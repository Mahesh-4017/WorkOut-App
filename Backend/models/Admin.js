const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
