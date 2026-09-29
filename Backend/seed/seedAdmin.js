require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDatabase = require('../config/db');
const Admin = require('../models/Admin');
const SiteSettings = require('../models/SiteSettings');

async function seed() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  await connectDatabase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash, failedLoginAttempts: 0, lockedUntil: null }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await SiteSettings.findOneAndUpdate({ key: 'default' }, { key: 'default' }, { upsert: true, setDefaultsOnInsert: true });
  console.log(`Admin seeded: ${process.env.ADMIN_EMAIL}`);
  process.exit(0);
}
seed().catch((error) => { console.error(error); process.exit(1); });
