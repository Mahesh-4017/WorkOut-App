const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  videoUrl: { type: String, required: true, trim: true },
  thumbnailUrl: { type: String, trim: true, default: '' },
  category: { type: String, trim: true, default: 'General' },
  audience: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  order: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  extraFields: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
