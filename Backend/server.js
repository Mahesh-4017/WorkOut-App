require('dotenv').config();
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');
const settingsRoutes = require('./routes/settings');
const appAuthRoutes = require('./routes/appAuth');
const appProfileRoutes = require('./routes/appProfile');
const nutritionRoutes = require('./routes/nutrition');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;
const LIVE_URL = 'https://workout-app-g3ag.onrender.com';
const clientUrl = process.env.CLIENT_URL || LIVE_URL;

const allowedOrigins = [
  LIVE_URL,
  clientUrl,
  `http://localhost:${port}`,
  'http://localhost:5000',
  'http://localhost:5001'
].filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many login attempts. Try again later.' } });
app.use(['/api/auth/login', '/api/v1/auth/login', '/api/app/auth/login', '/api/app/auth/register', '/api/app/auth/google', '/api/v1/app/auth/google', '/api/app/auth/apple', '/api/v1/app/auth/apple'], loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/app/auth', appAuthRoutes);
app.use('/api/v1/app/auth', appAuthRoutes);
app.use('/api/app/profile', appProfileRoutes);
app.use('/api/v1/app/profile', appProfileRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is healthy', data: { uptime: process.uptime() } }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', req.path === '/' ? 'index.html' : '404.html'));
});
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(port, () => console.log(`Dashboard running at http://localhost:${port}`));
}

if (require.main === module) start().catch((error) => { console.error(error); process.exit(1); });
module.exports = app;
