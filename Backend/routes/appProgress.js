const router = require('express').Router();
const { body, param } = require('express-validator');
const { requireUserAuth } = require('../middleware/appAuth');
const validate = require('../middleware/validate');
const {
  getProgress,
  createSession,
  updateFeedback,
  saveGoals,
  addWeightEntry,
  addStepEntry
} = require('../controllers/appProgressController');

router.use(requireUserAuth);

const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.get('/', asyncRoute(getProgress));

router.post('/sessions', [
  body('workoutId').isString().trim().isLength({ min: 1, max: 100 }),
  body('title').isString().trim().isLength({ min: 1, max: 160 }),
  body('startedAt').isISO8601().toDate(),
  body('seconds').isInt({ min: 0, max: 604800 }),
  body('calories').isFloat({ min: 0, max: 100000 }),
  body('distanceKm').isFloat({ min: 0, max: 10000 }),
  body('movesDone').isInt({ min: 0, max: 1000 }),
  body('movesTotal').isInt({ min: 0, max: 1000 }),
  body('movesDone').custom((value, { req }) => value <= req.body.movesTotal),
  body('setsDone').isInt({ min: 0, max: 10000 })
], validate, asyncRoute(createSession));

router.patch('/sessions/:id/feedback', [
  param('id').isMongoId(),
  body('rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }),
  body('effort').optional({ nullable: true }).isInt({ min: 1, max: 5 }),
  body('feel').optional().isArray({ max: 8 }),
  body('feel.*').optional().isString().trim().isLength({ min: 1, max: 40 }),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 1000 })
], validate, asyncRoute(updateFeedback));

router.put('/goals', [
  body().custom(value => Object.keys(value).length > 0),
  body('weeklySessions').optional({ nullable: true }).isInt({ min: 1, max: 21 }),
  body('targetWeightKg').optional({ nullable: true }).isFloat({ min: 20, max: 500 }),
  body('dailySteps').optional({ nullable: true }).isInt({ min: 1, max: 100000 }),
  body('dailyCalories').optional({ nullable: true }).isInt({ min: 1, max: 100000 })
], validate, asyncRoute(saveGoals));

router.post('/weight', [
  body('weightKg').isFloat({ min: 20, max: 500 }),
  body('recordedAt').optional().isISO8601().toDate()
], validate, asyncRoute(addWeightEntry));

router.post('/steps', [
  body('steps').isInt({ min: 0, max: 100000 }),
  body('recordedAt').optional().isISO8601().toDate()
], validate, asyncRoute(addStepEntry));

module.exports = router;
