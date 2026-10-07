const router = require('express').Router();
const { param, query } = require('express-validator');
const { publicCards, publicCard } = require('../controllers/cardController');
const { getSettings } = require('../controllers/settingsController');
const exerciseController = require('../controllers/exerciseController');
const validate = require('../middleware/validate');
const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const exerciseQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('bodyPart').optional().isString().trim().isLength({ max: 80 }),
  query('category').optional().isString().trim().isLength({ max: 80 }),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced'])
];
router.get('/cards', publicCards);
router.get('/cards/:id', publicCard);
router.get('/exercises/body-parts', asyncRoute(exerciseController.listBodyParts));
router.get('/exercises', exerciseQuery, validate, asyncRoute(exerciseController.listPublicExercises));
router.get('/exercises/:id', param('id').isMongoId(), validate, asyncRoute(exerciseController.getPublicExercise));
router.get('/settings', getSettings);
module.exports = router;
