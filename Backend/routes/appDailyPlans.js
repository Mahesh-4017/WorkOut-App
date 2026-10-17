const router = require('express').Router();
const { body, param } = require('express-validator');
const { requireUserAuth } = require('../middleware/appAuth');
const validate = require('../middleware/validate');
const controller = require('../controllers/appDailyPlanController');

const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(requireUserAuth);
router.get('/', asyncRoute(controller.list));
router.post('/', [
  body('title').isString().trim().isLength({ min: 1, max: 160 }),
  body('description').optional().isString().trim().isLength({ max: 500 }),
  body('date').isISO8601({ strict: true, strictSeparator: true }),
  body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('repeatDays').optional().isArray({ max: 7 }),
  body('repeatDays.*').optional().isInt({ min: 0, max: 6 }),
  body('reminderSoundUrl').optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
  body('reminderSoundTitle').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  body('reminderEnabled').optional().isBoolean()
], validate, asyncRoute(controller.create));
router.delete('/:id', param('id').isMongoId(), validate, asyncRoute(controller.remove));

module.exports = router;
