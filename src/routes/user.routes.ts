import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerUserValidation, loginValidation } from '../validators/user.validator';

const router = express.Router();

// Public routes
router.post('/register', registerUserValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Protected routes (require authentication)
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);

export default router;

