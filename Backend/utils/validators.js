const { body, param, query } = require('express-validator');

const objectId = param('id').isMongoId().withMessage('Invalid card id');
const url = (field, optional = true) => {
  const rule = optional ? body(field).optional({ values: 'falsy' }) : body(field).notEmpty();
  return rule.isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage(`${field} must be a valid http(s) URL`);
};

const cardFields = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('Title is required and must be 160 characters or fewer'),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('videoUrl').trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('videoUrl must be a valid http(s) URL'),
  url('thumbnailUrl'),
  body('category').optional().trim().isLength({ max: 80 }),
  body('audience').optional().isIn(['all', 'male', 'female']),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('tags.*').optional().isString().trim(),
  body('status').optional().isIn(['draft', 'published']),
  body('order').optional().isInt(),
  body('isFeatured').optional().isBoolean(),
  body('extraFields').optional().isObject()
];

const cardQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'published']),
  query('audience').optional().isIn(['all', 'male', 'female']),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'order', '-order', 'title', '-title'])
];

module.exports = { objectId, cardFields, cardQuery, url };
