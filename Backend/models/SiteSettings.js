const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  siteTitle: { type: String, default: 'Motion Library' },
  logoUrl: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    website: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
