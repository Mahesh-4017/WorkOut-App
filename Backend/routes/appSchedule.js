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
  body('time').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('durationMinutes').optional().isInt({ min: 1, max: 600 })
], validate, asyncRoute(controller.create));
router.delete('/:id', param('id').isMongoId(), validate, asyncRoute(controller.remove));

module.exports = router;
