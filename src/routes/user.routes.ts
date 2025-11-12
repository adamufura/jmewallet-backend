import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllEbooks,
  createEbook,
  updateEbook,
  deleteEbook,
  getAllStatements,
  createOrUpdateStatement,
  updateStatement,
  deleteStatement,
  depositUsd,
  swapUsdToCrypto,
  swapCryptoToUsd,
  swapCryptoToCrypto,
} from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerUserValidation,
  loginValidation,
  createEbookValidation,
  updateEbookValidation,
  createOrUpdateStatementValidation,
  updateStatementValidation,
  usdDepositValidation,
  usdToCryptoSwapValidation,
  cryptoToUsdSwapValidation,
  cryptoToCryptoSwapValidation,
} from '../validators/user.validator';

const router = express.Router();

// Public routes
router.post('/register', registerUserValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Protected routes (require authentication)
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);

// Ebook routes (require authentication)
router.get('/ebooks', authenticateUser, getAllEbooks);
router.post('/ebooks', authenticateUser, createEbookValidation, validate, createEbook);
router.put('/ebooks/:id', authenticateUser, updateEbookValidation, validate, updateEbook);
router.delete('/ebooks/:id', authenticateUser, deleteEbook);

// Statement routes (require authentication)
router.get('/statements', authenticateUser, getAllStatements);
router.post('/statements', authenticateUser, createOrUpdateStatementValidation, validate, createOrUpdateStatement);
router.put('/statements/:id', authenticateUser, updateStatementValidation, validate, updateStatement);
router.delete('/statements/:id', authenticateUser, deleteStatement);

// Wallet & swap routes (require authentication)
router.post('/wallets/usd/deposit', authenticateUser, usdDepositValidation, validate, depositUsd);
router.post('/swap/usd-to-crypto', authenticateUser, usdToCryptoSwapValidation, validate, swapUsdToCrypto);
router.post('/swap/crypto-to-usd', authenticateUser, cryptoToUsdSwapValidation, validate, swapCryptoToUsd);
router.post('/swap/crypto-to-crypto', authenticateUser, cryptoToCryptoSwapValidation, validate, swapCryptoToCrypto);

export default router;

