import { Response } from 'express';
import Admin from '../models/admin.model';
import { AdminAuthRequest, RegisterAdminDTO, LoginDTO } from '../types';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response';

export const registerAdmin = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name }: RegisterAdminDTO = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      errorResponse(res, 'Admin with this email already exists', 400);
      return;
    }

    // Create new admin
    const admin = await Admin.create({
      email,
      password,
      name,
    });

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });

    successResponse(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          isActive: admin.isActive,
          isSuperAdmin: admin.isSuperAdmin,
        },
      },
      'Admin registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Register admin error:', error);
    errorResponse(res, error.message || 'Failed to register admin', 500);
  }
};

export const loginAdmin = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    // Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      unauthorizedResponse(res, 'Your account has been deactivated');
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });

    successResponse(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          isActive: admin.isActive,
          isSuperAdmin: admin.isSuperAdmin,
          lastLogin: admin.lastLogin,
        },
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login admin error:', error);
    errorResponse(res, error.message || 'Failed to login', 500);
  }
};

export const getAdminProfile = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.admin?.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      errorResponse(res, 'Admin not found', 404);
      return;
    }

    successResponse(res, {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      isActive: admin.isActive,
      isSuperAdmin: admin.isSuperAdmin,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  } catch (error: any) {
    console.error('Get admin profile error:', error);
    errorResponse(res, error.message || 'Failed to get admin profile', 500);
  }
};

