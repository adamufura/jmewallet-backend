import { Request } from 'express';
import { Document } from 'mongoose';

// Extend Express Request to include authenticated user/admin
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user';
  };
}

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: 'admin';
  };
}

// User related interfaces
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  verificationLevel: number;
  kycDocuments?: {
    documentType: string;
    documentUrl: string;
    uploadedAt: Date;
  }[];
  wallets: {
    currency: string;
    address: string;
    balance: number;
    createdAt: Date;
  }[];
  balances: Map<string, number>;
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Admin related interfaces
export interface IAdmin extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Registration/Login DTOs
export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referralCode?: string;
}

export interface RegisterAdminDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

