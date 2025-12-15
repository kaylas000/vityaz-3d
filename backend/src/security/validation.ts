import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware factory
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((err) => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg,
        })),
      });
    }
    next();
  };
};

/**
 * User registration validation
 */
export const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

/**
 * User login validation
 */
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .escape(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Game score validation
 */
export const validateGameScore = [
  body('score')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Invalid score'),

  body('kills')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Invalid kills count'),

  body('wave')
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid wave number'),

  body('duration')
    .isInt({ min: 0, max: 3600000 })
    .withMessage('Invalid game duration'),
];

/**
 * Username update validation
 */
export const validateUsernameUpdate = [
  body('newUsername')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
];
