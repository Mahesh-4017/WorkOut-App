const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireUserAuth } = require('../middleware/appAuth');
const controller = require('../controllers/appAuthController');

const profileFields = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').optional().isString(),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('height').optional().isFloat({ min: 50, max: 280 }),
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('goal').optional().isString()
];

router.post('/register', profileFields, validate, controller.register);
router.post('/login', [body('email').isEmail(), body('password').isString().notEmpty()], validate, controller.login);
router.post('/forgot-password', [body('email').isEmail()], validate, controller.requestPasswordReset);
router.post('/reset-password', [body('token').isString().isLength({ min: 64, max: 64 }).isHexadecimal(), body('password').isString().isLength({ min: 6 })], validate, controller.resetPassword);
router.get('/me', requireUserAuth, controller.me);
router.put('/profile', requireUserAuth, [body('name').optional().trim().isLength({ min: 2, max: 100 }), body('gender').optional().isString(), body('age').optional().isInt({ min: 13, max: 120 }), body('height').optional().isFloat({ min: 50, max: 280 }), body('weight').optional().isFloat({ min: 20, max: 500 }), body('goal').optional().isString()], validate, controller.updateProfile);

module.exports = router;
