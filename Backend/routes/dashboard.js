const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { stats } = require('../controllers/dashboardController');
router.get('/stats', requireAuth, stats);
module.exports = router;
