const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(payload.sub).select('-passwordHash');
    if (!req.admin) return res.status(401).json({ success: false, message: 'Session is no longer valid' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = { requireAuth };
