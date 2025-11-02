import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model';
import UserEbook, { IUserEbook } from '../models/userebook.model';
import UserStatement, { IUserStatement } from '../models/userstatement.model';
import { AuthRequest, RegisterUserDTO, LoginDTO } from '../types';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '../utils/response';

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

// Get all ebooks for authenticated user
export const getAllEbooks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const ebooks = await UserEbook.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .select('-__v');

    successResponse(
      res,
      ebooks.map((ebook: IUserEbook) => ({
        id: (ebook._id as mongoose.Types.ObjectId).toString(),
        title: ebook.title,
        content: ebook.content,
        createdAt: ebook.createdAt.toISOString(),
        updatedAt: ebook.updatedAt.toISOString(),
      })),
      'Ebooks retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get all ebooks error:', error);
    errorResponse(res, error.message || 'Failed to retrieve ebooks', 500);
  }
};

// Create a new ebook
export const createEbook = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, content } = req.body;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const ebook = await UserEbook.create({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      content,
    });

    successResponse(
      res,
      {
        id: (ebook._id as mongoose.Types.ObjectId).toString(),
        title: ebook.title,
        content: ebook.content,
        createdAt: ebook.createdAt.toISOString(),
        updatedAt: ebook.updatedAt.toISOString(),
      },
      'Ebook created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create ebook error:', error);
    errorResponse(res, error.message || 'Failed to create ebook', 500);
  }
};

// Update an ebook
export const updateEbook = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const ebook = await UserEbook.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!ebook) {
      notFoundResponse(res, 'Ebook not found or you do not have permission to access it');
      return;
    }

    if (title !== undefined) ebook.title = title;
    if (content !== undefined) ebook.content = content;

    await ebook.save();

    successResponse(
      res,
      {
        id: (ebook._id as mongoose.Types.ObjectId).toString(),
        title: ebook.title,
        content: ebook.content,
        createdAt: ebook.createdAt.toISOString(),
        updatedAt: ebook.updatedAt.toISOString(),
      },
      'Ebook updated successfully'
    );
  } catch (error: any) {
    console.error('Update ebook error:', error);
    errorResponse(res, error.message || 'Failed to update ebook', 500);
  }
};

// Delete an ebook
export const deleteEbook = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const ebook = await UserEbook.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!ebook) {
      notFoundResponse(res, 'Ebook not found or you do not have permission to delete it');
      return;
    }

    await UserEbook.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    successResponse(res, null, 'Ebook deleted successfully');
  } catch (error: any) {
    console.error('Delete ebook error:', error);
    errorResponse(res, error.message || 'Failed to delete ebook', 500);
  }
};

// Get all statements for authenticated user
export const getAllStatements = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const statements = await UserStatement.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .select('-__v');

    successResponse(
      res,
      statements.map((statement: IUserStatement) => ({
        id: (statement._id as mongoose.Types.ObjectId).toString(),
        date: statement.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        earnings: statement.earnings,
        spending: statement.spending,
        notes: statement.notes,
      })),
      'Statements retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get all statements error:', error);
    errorResponse(res, error.message || 'Failed to retrieve statements', 500);
  }
};

// Create or update a statement (upsert based on date)
export const createOrUpdateStatement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date, earnings, spending, notes } = req.body;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    // Convert date string to Date object
    const statementDate = new Date(date);
    if (isNaN(statementDate.getTime())) {
      errorResponse(res, 'Invalid date format', 400);
      return;
    }

    // Normalize date to start of day for consistency (create new Date to avoid mutation)
    const normalizedDate = new Date(statementDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const statement = await UserStatement.findOneAndUpdate(
      { 
        userId: new mongoose.Types.ObjectId(userId), 
        date: normalizedDate 
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        date: normalizedDate,
        earnings: earnings || 0,
        spending: spending || 0,
        notes: notes || undefined,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    successResponse(
      res,
      {
        id: (statement._id as mongoose.Types.ObjectId).toString(),
        date: statement.date.toISOString().split('T')[0],
        earnings: statement.earnings,
        spending: statement.spending,
        notes: statement.notes,
      },
      'Statement saved successfully',
      201
    );
  } catch (error: any) {
    console.error('Create or update statement error:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Statement for this date already exists', 400);
    } else {
      errorResponse(res, error.message || 'Failed to save statement', 500);
    }
  }
};

// Update a statement
export const updateStatement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { date, earnings, spending, notes } = req.body;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const statement = await UserStatement.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!statement) {
      notFoundResponse(res, 'Statement not found or you do not have permission to access it');
      return;
    }

    if (date !== undefined) {
      const statementDate = new Date(date);
      if (isNaN(statementDate.getTime())) {
        errorResponse(res, 'Invalid date format', 400);
        return;
      }
      const normalizedDate = new Date(statementDate);
      normalizedDate.setHours(0, 0, 0, 0);
      statement.date = normalizedDate;
    }
    if (earnings !== undefined) statement.earnings = earnings;
    if (spending !== undefined) statement.spending = spending;
    if (notes !== undefined) statement.notes = notes || undefined;

    await statement.save();

    successResponse(
      res,
      {
        id: (statement._id as mongoose.Types.ObjectId).toString(),
        date: statement.date.toISOString().split('T')[0],
        earnings: statement.earnings,
        spending: statement.spending,
        notes: statement.notes,
      },
      'Statement updated successfully'
    );
  } catch (error: any) {
    console.error('Update statement error:', error);
    errorResponse(res, error.message || 'Failed to update statement', 500);
  }
};

// Delete a statement
export const deleteStatement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      unauthorizedResponse(res, 'User not authenticated');
      return;
    }

    const statement = await UserStatement.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!statement) {
      notFoundResponse(res, 'Statement not found or you do not have permission to delete it');
      return;
    }

    await UserStatement.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    successResponse(res, null, 'Statement deleted successfully');
  } catch (error: any) {
    console.error('Delete statement error:', error);
    errorResponse(res, error.message || 'Failed to delete statement', 500);
  }
};

