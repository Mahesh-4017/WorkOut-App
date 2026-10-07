const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireUserAuth } = require('../middleware/appAuth');
const controller = require('../controllers/appAuthController');
const otpController = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

const profileFields = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).isString().isLength({ min: 8, max: 20 }),
  body('gender').optional().isString(),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('height').optional().isFloat({ min: 50, max: 280 }),
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('goal').optional().isString()
];

router.post('/register', profileFields, validate, controller.register);
router.post('/login', [body('email').isEmail(), body('password').isString().notEmpty()], validate, controller.login);
router.post('/google', [body('idToken').isString().notEmpty()], validate, controller.loginWithGoogle);
router.post('/apple', [body('idToken').isString().notEmpty(), body('nonce').isString().notEmpty(), body('name').optional().isString().isLength({ max: 100 })], validate, controller.loginWithApple);
const otpRateLimit = (limit) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, message: 'Too many OTP requests. Please try again later.' })
});

router.post('/otp/send', otpRateLimit(10), [body('purpose').isIn(['verifyEmail', 'verifyPhone', 'resetPassword']), body('target').isString().notEmpty()], validate, otpController.send);
router.post('/otp/verify', otpRateLimit(30), [body('purpose').isIn(['verifyEmail', 'verifyPhone', 'resetPassword']), body('target').isString().notEmpty(), body('code').isString().matches(/^\d{6}$/)], validate, otpController.verify);
router.post('/otp/reset-password', otpRateLimit(10), [body('email').isEmail(), body('code').isString().matches(/^\d{6}$/), body('newPassword').isLength({ min: 8 })], validate, otpController.resetPassword);
router.get('/me', requireUserAuth, controller.me);
router.put('/profile', requireUserAuth, [body('name').optional().trim().isLength({ min: 2, max: 100 }), body('gender').optional().isString(), body('age').optional().isInt({ min: 13, max: 120 }), body('height').optional().isFloat({ min: 50, max: 280 }), body('weight').optional().isFloat({ min: 20, max: 500 }), body('goal').optional().isString()], validate, controller.updateProfile);

module.exports = router;
