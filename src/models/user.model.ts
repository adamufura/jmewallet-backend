import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, SupportedCoin } from '../types';

export const SUPPORTED_COINS: SupportedCoin[] = [
  'BTC',
  'ETH',
  'TRX',
  'BNB',
  'MATIC',
  'USDT_TRC20',
  'USDT_BEP20',
  'BTG',
];

const createDefaultUsdWallet = () => ({
  balance: 0,
  lockedBalance: 0,
  currency: 'USD' as const,
  lastUpdated: new Date(),
});

const createDefaultBalancesMap = () => {
  const balances = new Map<string, number>();
  SUPPORTED_COINS.forEach((coin) => {
    balances.set(coin, 0);
  });
  return balances;
};

const usdWalletSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const walletSchema = new Schema(
  {
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      enum: SUPPORTED_COINS,
    },
    network: {
      type: String,
    },
    address: {
      type: String,
      default: '',
    },
    privateKeyEncrypted: {
      type: String,
      default: '',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const createDefaultWallets = () =>
  SUPPORTED_COINS.map((coin) => ({
    currency: coin,
    symbol: coin,
    balance: 0,
    lockedBalance: 0,
    address: '',
    privateKeyEncrypted: '',
  }));

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    kycDocuments: [
      {
        documentType: {
          type: String,
          enum: ['passport', 'drivers_license', 'national_id', 'proof_of_address'],
        },
        documentUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    usdWallet: {
      type: usdWalletSchema,
      default: () => createDefaultUsdWallet(),
    },
    wallets: {
      type: [walletSchema],
      default: () => createDefaultWallets(),
    },
    balances: {
      type: Map,
      of: Number,
      default: () => createDefaultBalancesMap(),
    },
    lockedBalances: {
      type: Map,
      of: Number,
      default: () => createDefaultBalancesMap(),
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.ensureBalanceMaps = function (this: IUser) {
  if (!this.balances || !(this.balances instanceof Map)) {
    this.balances = createDefaultBalancesMap();
  }
  if (!this.lockedBalances || !(this.lockedBalances instanceof Map)) {
    this.lockedBalances = createDefaultBalancesMap();
  }

  SUPPORTED_COINS.forEach((coin) => {
    if (!this.balances.has(coin)) {
      this.balances.set(coin, 0);
    }
    if (!this.lockedBalances.has(coin)) {
      this.lockedBalances.set(coin, 0);
    }
  });
};

userSchema.methods.ensureWallet = function (this: IUser, symbol: SupportedCoin) {
  this.ensureBalanceMaps();
  let wallet = this.wallets.find((w) => w.symbol === symbol) as any;
  if (!wallet) {
    wallet = {
      currency: symbol,
      symbol,
      address: '',
      privateKeyEncrypted: '',
      balance: this.balances.get(symbol) || 0,
      lockedBalance: this.lockedBalances.get(symbol) || 0,
    } as any;
    this.wallets.push(wallet);
  }
  return wallet;
};

userSchema.methods.creditUSD = function (this: IUser, amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  if (!this.usdWallet) {
    this.usdWallet = createDefaultUsdWallet();
  }
  this.usdWallet.balance += amount;
  this.usdWallet.lastUpdated = new Date();
};

userSchema.methods.debitUSD = function (this: IUser, amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  if (!this.usdWallet || this.usdWallet.balance < amount) {
    throw new Error('Insufficient USD balance');
  }
  this.usdWallet.balance -= amount;
  this.usdWallet.lastUpdated = new Date();
};

userSchema.methods.adjustCryptoBalance = function (
  this: IUser,
  symbol: SupportedCoin,
  amount: number
) {
  this.ensureBalanceMaps();
  if (!SUPPORTED_COINS.includes(symbol)) {
    throw new Error(`Unsupported coin: ${symbol}`);
  }
  const current = this.balances.get(symbol) || 0;
  const next = current + amount;
  if (next < 0) {
    throw new Error(`Insufficient ${symbol} balance`);
  }
  this.balances.set(symbol, next);
  const wallet = this.ensureWallet(symbol);
  wallet.balance = next;
};

userSchema.methods.lockCryptoBalance = function (
  this: IUser,
  symbol: SupportedCoin,
  amount: number
) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  this.ensureBalanceMaps();
  const available = this.balances.get(symbol) || 0;
  if (available < amount) {
    throw new Error(`Insufficient ${symbol} balance to lock`);
  }
  const locked = this.lockedBalances.get(symbol) || 0;
  this.balances.set(symbol, available - amount);
  this.lockedBalances.set(symbol, locked + amount);
  const wallet = this.ensureWallet(symbol);
  wallet.balance = this.balances.get(symbol) || 0;
  wallet.lockedBalance = this.lockedBalances.get(symbol) || 0;
};

userSchema.methods.unlockCryptoBalance = function (
  this: IUser,
  symbol: SupportedCoin,
  amount: number
) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  this.ensureBalanceMaps();
  const locked = this.lockedBalances.get(symbol) || 0;
  if (locked < amount) {
    throw new Error(`Insufficient ${symbol} locked balance to unlock`);
  }
  const available = this.balances.get(symbol) || 0;
  this.lockedBalances.set(symbol, locked - amount);
  this.balances.set(symbol, available + amount);
  const wallet = this.ensureWallet(symbol);
  wallet.balance = this.balances.get(symbol) || 0;
  wallet.lockedBalance = this.lockedBalances.get(symbol) || 0;
};

userSchema.pre('save', function (next) {
  if (!this.usdWallet) {
    this.usdWallet = createDefaultUsdWallet();
  }
  this.ensureBalanceMaps();
  this.wallets = this.wallets || [];
  SUPPORTED_COINS.forEach((coin) => {
    const wallet = this.ensureWallet(coin);
    wallet.balance = this.balances.get(coin) || 0;
    wallet.lockedBalance = this.lockedBalances.get(coin) || 0;
    wallet.updatedAt = new Date();
  });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this._id.toString().substring(0, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export { IUser };
export default User;

