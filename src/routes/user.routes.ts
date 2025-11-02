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
} from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerUserValidation, loginValidation } from '../validators/user.validator';
import { createEbookValidation, updateEbookValidation } from '../validators/user.validator';

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

export default router;

