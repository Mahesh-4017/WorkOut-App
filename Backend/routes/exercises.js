const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/exerciseController');
const { imageUrl } = require('../utils/validators');

const asyncRoute = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const exerciseFields = [
  body('title').isString().trim().isLength({ min: 1, max: 160 }),
  body('description').optional().isString().isLength({ max: 3000 }),
  body('bodyPart').isString().trim().isLength({ min: 1, max: 80 }),
  body('category').isString().trim().isLength({ min: 1, max: 80 }),
  body('muscles').optional().isArray({ max: 20 }),
  body('muscles.*').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('durationMinutes').optional().isInt({ min: 1, max: 600 }),
  body('equipment').optional().isArray({ max: 20 }),
  body('equipment.*').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('imageUrl').optional({ values: 'falsy' }).custom(imageUrl).withMessage('imageUrl must be a valid http(s) URL or uploaded image URL'),
  body('videoUrl').isString().trim().isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('instructions').optional().isArray({ max: 30 }),
  body('instructions.*').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('status').optional().isIn(['draft', 'published']),
  body('order').optional().isInt()
];
const queryFields = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'published']),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('bodyPart').optional().isString().trim().isLength({ max: 80 }),
  query('category').optional().isString().trim().isLength({ max: 80 }),
  query('search').optional().isString().trim().isLength({ max: 100 })
];

router.use(requireAuth);
router.get('/', queryFields, validate, asyncRoute(controller.listExercises));
router.post('/', exerciseFields, validate, asyncRoute(controller.createExercise));
router.get('/:id', param('id').isMongoId(), validate, asyncRoute(controller.getExercise));
router.put('/:id', param('id').isMongoId(), exerciseFields, validate, asyncRoute(controller.updateExercise));
router.delete('/:id', param('id').isMongoId(), validate, asyncRoute(controller.deleteExercise));

module.exports = router;
