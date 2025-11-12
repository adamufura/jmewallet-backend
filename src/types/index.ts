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

export type SupportedCoin =
  | 'BTC'
  | 'ETH'
  | 'TRX'
  | 'BNB'
  | 'MATIC'
  | 'USDT_TRC20'
  | 'USDT_BEP20'
  | 'BTG';

export interface UsdWallet {
  balance: number;
  lockedBalance: number;
  currency: 'USD';
  lastUpdated: Date;
}

export interface CryptoWallet {
  currency: string;
  symbol: SupportedCoin;
  network?: string;
  address: string;
  privateKeyEncrypted: string;
  balance: number;
  lockedBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  usdWallet: UsdWallet;
  wallets: CryptoWallet[];
  balances: Map<string, number>;
  lockedBalances: Map<string, number>;
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  ensureBalanceMaps(): void;
  ensureWallet(symbol: SupportedCoin): CryptoWallet;
  creditUSD(amount: number): void;
  debitUSD(amount: number): void;
  adjustCryptoBalance(symbol: SupportedCoin, amount: number): void;
  lockCryptoBalance(symbol: SupportedCoin, amount: number): void;
  unlockCryptoBalance(symbol: SupportedCoin, amount: number): void;
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

export interface UsdDepositDTO {
  amount: number;
  metadata?: Record<string, any>;
}

export interface SwapRequestDTO {
  amount: number;
  from?: string;
  to?: string;
}

export interface SwapQuote {
  fromSymbol: 'USD' | SupportedCoin;
  toSymbol: 'USD' | SupportedCoin;
  fromAmount: number;
  toAmount: number;
  usdRateFrom?: number;
  usdRateTo?: number;
}

