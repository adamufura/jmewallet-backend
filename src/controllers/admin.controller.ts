import { Response } from 'express';
import mongoose from 'mongoose';
import Admin, { IAdmin } from '../models/admin.model';
import User, { IUser } from '../models/user.model';
import { AdminAuthRequest, RegisterAdminDTO, LoginDTO } from '../types';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '../utils/response';

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

// Get all users (admin only)
export const getAllUsers = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .sort({ createdAt: -1 });

    successResponse(
      res,
      users.map((user: IUser) => ({
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        country: '', // Not in user model currently
        balance: Array.from(user.balances.values()).reduce((sum: number, balance: number) => sum + balance, 0),
        status: user.isActive ? 'active' : 'frozen',
        isActive: user.isActive,
        wallets: user.wallets?.length || 0,
        kycStatus: user.kycStatus,
        verificationLevel: user.verificationLevel,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      'Users retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get all users error:', error);
    errorResponse(res, error.message || 'Failed to retrieve users', 500);
  }
};

// Get all admins (admin only)
export const getAllAdmins = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const admins = await Admin.find()
      .select('-password -__v')
      .sort({ createdAt: -1 });

    successResponse(
      res,
      admins.map((admin: IAdmin) => ({
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      })),
      'Admins retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get all admins error:', error);
    errorResponse(res, error.message || 'Failed to retrieve admins', 500);
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (
  req: AdminAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      errorResponse(res, 'isActive must be a boolean', 400);
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    user.isActive = isActive;
    await user.save();

    successResponse(
      res,
      {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        isActive: user.isActive,
        status: user.isActive ? 'active' : 'frozen',
      },
      `User ${isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error: any) {
    console.error('Update user status error:', error);
    errorResponse(res, error.message || 'Failed to update user status', 500);
  }
};

