const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/settingsController');
router.get('/', requireAuth, controller.getSettings);
router.put('/', requireAuth, controller.updateSettings);
module.exports = router;
