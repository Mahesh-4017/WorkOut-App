const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireUserAuth } = require('../middleware/appAuth');
const { updateProfile } = require('../controllers/appAuthController');

router.put('/', requireUserAuth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('gender').optional().isString(),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('height').optional().isFloat({ min: 50, max: 280 }),
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('goal').optional().isString()
], validate, updateProfile);

module.exports = router;