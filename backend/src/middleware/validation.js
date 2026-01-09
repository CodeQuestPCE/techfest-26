const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Input sanitization middleware - prevent excessively long inputs
const sanitizeInputLength = (req, res, next) => {
  const maxLengths = {
    name: 100,
    email: 100,
    password: 128,
    phone: 20,
    college: 200,
    description: 5000,
    title: 200,
    venue: 200,
    address: 500,
    utrNumber: 50,
    teamName: 100,
    referralCode: 50
  };

  const checkLength = (obj, parentKey = '') => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && maxLengths[key]) {
        if (obj[key].length > maxLengths[key]) {
          return {
            valid: false,
            field: parentKey ? `${parentKey}.${key}` : key,
            max: maxLengths[key]
          };
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkLength(obj[key], key);
        if (!result.valid) return result;
      }
    }
    return { valid: true };
  };

  const result = checkLength(req.body);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: `Field '${result.field}' exceeds maximum length of ${result.max} characters`
    });
  }

  next();
};

// Common validation rules
const validationRules = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6-128 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits')
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],

  createEvent: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 5000 }).withMessage('Description too long'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required'),
    body('registrationFee')
      .isInt({ min: 0, max: 100000 }).withMessage('Invalid registration fee'),
    body('venue')
      .trim()
      .notEmpty().withMessage('Venue is required')
      .isLength({ max: 200 }).withMessage('Venue too long'),
    body('capacity')
      .isInt({ min: 1, max: 10000 }).withMessage('Capacity must be between 1-10000')
  ],

  registration: [
    body('utrNumber')
      .optional()
      .trim()
      .isLength({ min: 12, max: 50 }).withMessage('UTR must be 12+ characters'),
    body('teamName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Team name must be between 2-100 characters')
  ]
};

module.exports = {
  validate,
  sanitizeInputLength,
  validationRules
};
