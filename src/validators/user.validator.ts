import { body } from 'express-validator';
import { SUPPORTED_COINS } from '../models/user.model';

const SUPPORTED_COIN_MESSAGE = `Coin must be one of: ${SUPPORTED_COINS.join(', ')}`;

const isSupportedCoin = (value: string) =>
  SUPPORTED_COINS.includes(value.toUpperCase() as (typeof SUPPORTED_COINS)[number]);

export const registerUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('referralCode')
    .optional()
    .isString()
    .withMessage('Invalid referral code'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const createEbookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
];

export const updateEbookValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
];

export const createOrUpdateStatementValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string (YYYY-MM-DD)'),
  body('earnings')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Earnings must be a non-negative number'),
  body('spending')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Spending must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const updateStatementValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string (YYYY-MM-DD)'),
  body('earnings')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Earnings must be a non-negative number'),
  body('spending')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Spending must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const usdDepositValidation = [
  body('amount')
    .exists()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

export const usdToCryptoSwapValidation = [
  body('amount')
    .exists()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('to')
    .exists()
    .withMessage('Destination coin is required')
    .isString()
    .withMessage('Destination coin must be a string')
    .bail()
    .custom((value) => isSupportedCoin(value))
    .withMessage(SUPPORTED_COIN_MESSAGE),
];

export const cryptoToUsdSwapValidation = [
  body('amount')
    .exists()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('from')
    .exists()
    .withMessage('Source coin is required')
    .isString()
    .withMessage('Source coin must be a string')
    .bail()
    .custom((value) => isSupportedCoin(value))
    .withMessage(SUPPORTED_COIN_MESSAGE),
];

export const cryptoToCryptoSwapValidation = [
  body('amount')
    .exists()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('from')
    .exists()
    .withMessage('Source coin is required')
    .isString()
    .withMessage('Source coin must be a string')
    .bail()
    .custom((value) => isSupportedCoin(value))
    .withMessage(SUPPORTED_COIN_MESSAGE),
  body('to')
    .exists()
    .withMessage('Destination coin is required')
    .isString()
    .withMessage('Destination coin must be a string')
    .bail()
    .custom((value) => isSupportedCoin(value))
    .withMessage(SUPPORTED_COIN_MESSAGE),
  body('to').custom((value, { req }) => {
    if (value && req.body.from && value.toUpperCase() === req.body.from.toUpperCase()) {
      throw new Error('Source and destination coins must be different');
    }
    return true;
  }),
];

