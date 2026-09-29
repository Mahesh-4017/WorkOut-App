const router = require('express').Router();
const { publicCards, publicCard } = require('../controllers/cardController');
const { getSettings } = require('../controllers/settingsController');
router.get('/cards', publicCards);
router.get('/cards/:id', publicCard);
router.get('/settings', getSettings);
module.exports = router;
