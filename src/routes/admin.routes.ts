import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  getAllAdmins,
  updateUserStatus,
} from '../controllers/admin.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerAdminValidation, loginAdminValidation } from '../validators/admin.validator';

const router = express.Router();

// Public routes
router.post('/register', registerAdminValidation, validate, registerAdmin);
router.post('/login', loginAdminValidation, validate, loginAdmin);

// Protected routes (require admin authentication)
router.get('/profile', authenticateAdmin, getAdminProfile);

// User management routes
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/admins', authenticateAdmin, getAllAdmins);
router.put('/users/:id/status', authenticateAdmin, updateUserStatus);

export default router;

