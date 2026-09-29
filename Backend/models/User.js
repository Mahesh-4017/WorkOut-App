const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  gender: { type: String, trim: true, default: '' },
  age: { type: Number, min: 13, max: 120 },
  height: { type: Number, min: 50, max: 280 },
  weight: { type: Number, min: 20, max: 500 },
  goal: { type: String, trim: true, default: '' },
  lastLoginAt: { type: Date, default: null },
  loginCount: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    gender: this.gender,
    age: this.age,
    height: this.height,
    weight: this.weight,
    goal: this.goal,
    lastLoginAt: this.lastLoginAt,
    loginCount: this.loginCount,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
