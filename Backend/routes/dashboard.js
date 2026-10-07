const router = require('express').Router();
const { param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { stats, getUser } = require('../controllers/dashboardController');
const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
router.get('/users/:id', requireAuth, param('id').isMongoId(), validate, asyncRoute(getUser));
router.get('/stats', requireAuth, asyncRoute(stats));
module.exports = router;
