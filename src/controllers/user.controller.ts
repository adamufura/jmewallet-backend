import { Response } from 'express';
import User from '../models/user.model';
import { AuthRequest, RegisterUserDTO, LoginDTO } from '../types';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response';

export const registerUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, referralCode }: RegisterUserDTO = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'User with this email already exists', 400);
      return;
    }

    // Check if referral code is valid (if provided)
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        errorResponse(res, 'Invalid referral code', 400);
        return;
      }
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      referredBy: referralCode,
    });

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'user',
    });

    successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          kycStatus: user.kycStatus,
          verificationLevel: user.verificationLevel,
          referralCode: user.referralCode,
          isActive: user.isActive,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Register user error:', error);
    errorResponse(res, error.message || 'Failed to register user', 500);
  }
};

export const loginUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      unauthorizedResponse(res, 'Your account has been deactivated');
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'user',
    });

    successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          kycStatus: user.kycStatus,
          verificationLevel: user.verificationLevel,
          referralCode: user.referralCode,
          wallets: user.wallets,
          balances: Object.fromEntries(user.balances),
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        },
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login user error:', error);
    errorResponse(res, error.message || 'Failed to login', 500);
  }
};

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      kycStatus: user.kycStatus,
      verificationLevel: user.verificationLevel,
      kycDocuments: user.kycDocuments,
      wallets: user.wallets,
      balances: Object.fromEntries(user.balances),
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    errorResponse(res, error.message || 'Failed to get user profile', 500);
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    successResponse(
      res,
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        kycStatus: user.kycStatus,
        verificationLevel: user.verificationLevel,
        updatedAt: user.updatedAt,
      },
      'Profile updated successfully'
    );
  } catch (error: any) {
    console.error('Update user profile error:', error);
    errorResponse(res, error.message || 'Failed to update profile', 500);
  }
};

