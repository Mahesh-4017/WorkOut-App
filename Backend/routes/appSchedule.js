const router = require('express').Router();
const { body, param } = require('express-validator');
const { requireUserAuth } = require('../middleware/appAuth');
const validate = require('../middleware/validate');
const controller = require('../controllers/appScheduleController');

const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(requireUserAuth);
router.get('/', asyncRoute(controller.list));
router.post('/', [
  body('exerciseId').optional().isMongoId(),
  body('classId').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('title').isString().trim().isLength({ min: 1, max: 160 }),
  body('bodyPart').optional().isString().trim().isLength({ max: 80 }),
  body('category').optional().isString().trim().isLength({ max: 80 }),
  body('date').isISO8601({ strict: true, strictSeparator: true }),
  body().custom(value => Boolean(value.exerciseId || value.classId || value.bodyPart?.trim())).withMessage('Choose a body part to schedule'),
  body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('durationMinutes').optional().isInt({ min: 1, max: 600 }),
  body('repeatDays').optional().isArray({ max: 7 }),
  body('repeatDays.*').optional().isInt({ min: 0, max: 6 }),
  body('repeatDates').optional().isArray({ max: 30 }),
  body('repeatDates.*').optional().isISO8601({ strict: true, strictSeparator: true }),
  body().custom(value => !(value.repeatDays?.length && value.repeatDates?.length)).withMessage('Choose weekly repeats or specific dates, not both'),
  body('repeatDates').custom(values => !values || new Set(values).size === values.length).withMessage('Specific workout dates must be unique'),
  body('reminderTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('reminderSoundUrl').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('reminderSoundTitle').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('reminderEnabled').optional().isBoolean()
], validate, asyncRoute(controller.create));
router.delete('/:id', param('id').isMongoId(), validate, asyncRoute(controller.remove));

module.exports = router;
