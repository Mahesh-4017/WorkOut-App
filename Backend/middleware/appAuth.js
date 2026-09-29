const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireUserAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Session is no longer valid' });
    req.appUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = { requireUserAuth };
