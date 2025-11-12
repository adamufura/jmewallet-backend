import { Schema, model, Types, Document } from 'mongoose';
import { SupportedCoin } from '../types';

export type SwapTransactionType =
  | 'USD_DEPOSIT'
  | 'USD_TO_CRYPTO'
  | 'CRYPTO_TO_USD'
  | 'CRYPTO_TO_CRYPTO';

export interface ISwapTransaction extends Document {
  userId: Types.ObjectId;
  type: SwapTransactionType;
  fromSymbol: 'USD' | SupportedCoin;
  toSymbol: 'USD' | SupportedCoin;
  fromAmount: number;
  toAmount: number;
  rate: number;
  usdRateFrom?: number;
  usdRateTo?: number;
  status: 'completed' | 'pending' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const swapTransactionSchema = new Schema<ISwapTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['USD_DEPOSIT', 'USD_TO_CRYPTO', 'CRYPTO_TO_USD', 'CRYPTO_TO_CRYPTO'],
      required: true,
    },
    fromSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    toSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    fromAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    toAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    usdRateFrom: {
      type: Number,
      min: 0,
    },
    usdRateTo: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

swapTransactionSchema.index({ userId: 1, createdAt: -1 });

const SwapTransaction = model<ISwapTransaction>('SwapTransaction', swapTransactionSchema);

export default SwapTransaction;
