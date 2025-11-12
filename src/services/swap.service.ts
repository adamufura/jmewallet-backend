import { Types } from 'mongoose';
import { IUser, SupportedCoin, SwapQuote } from '../types';
import { SUPPORTED_COINS } from '../models/user.model';
import SwapTransaction, { ISwapTransaction, SwapTransactionType } from '../models/swapTransaction.model';
import { rateService } from './rate.service';

const SUPPORTED_SET = new Set<SupportedCoin>(SUPPORTED_COINS);

const ensureState = (user: IUser) => {
  if (typeof user.ensureBalanceMaps === 'function') {
    user.ensureBalanceMaps();
  }
};

const toSupportedCoin = (symbol: string): SupportedCoin => {
  const upper = symbol.toUpperCase();
  if (!SUPPORTED_SET.has(upper as SupportedCoin)) {
    throw new Error(`Unsupported coin symbol: ${symbol}`);
  }
  return upper as SupportedCoin;
};

const formatAmount = (amount: number, decimals = 8) => Number(amount.toFixed(decimals));

interface SwapLogPayload {
  type: SwapTransactionType;
  userId: Types.ObjectId;
  fromSymbol: 'USD' | SupportedCoin;
  toSymbol: 'USD' | SupportedCoin;
  fromAmount: number;
  toAmount: number;
  rate: number;
  usdRateFrom?: number;
  usdRateTo?: number;
  metadata?: Record<string, any>;
}

const logSwapTransaction = async (payload: SwapLogPayload): Promise<ISwapTransaction> => {
  return SwapTransaction.create({
    userId: payload.userId,
    type: payload.type,
    fromSymbol: payload.fromSymbol,
    toSymbol: payload.toSymbol,
    fromAmount: payload.fromAmount,
    toAmount: payload.toAmount,
    rate: payload.rate,
    usdRateFrom: payload.usdRateFrom,
    usdRateTo: payload.usdRateTo,
    status: 'completed',
    metadata: payload.metadata,
  });
};

export interface SwapResult {
  user: IUser;
  transaction: ISwapTransaction;
  quote: SwapQuote;
}

const buildResult = (
  user: IUser,
  transaction: ISwapTransaction
): SwapResult => ({
  user,
  transaction,
  quote: {
    fromSymbol: transaction.fromSymbol as 'USD' | SupportedCoin,
    toSymbol: transaction.toSymbol as 'USD' | SupportedCoin,
    fromAmount: transaction.fromAmount,
    toAmount: transaction.toAmount,
    usdRateFrom: transaction.usdRateFrom,
    usdRateTo: transaction.usdRateTo,
  },
});

export const swapService = {
  async depositUsd(user: IUser, amount: number, metadata?: Record<string, any>): Promise<SwapResult> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    ensureState(user);
    user.creditUSD(amount);
    await user.save();

    const transaction = await logSwapTransaction({
      type: 'USD_DEPOSIT',
      userId: user._id as unknown as Types.ObjectId,
      fromSymbol: 'USD',
      toSymbol: 'USD',
      fromAmount: amount,
      toAmount: amount,
      rate: 1,
      metadata,
    });

    return buildResult(user, transaction);
  },

  async usdToCrypto(user: IUser, amountUsd: number, toSymbolValue: string): Promise<SwapResult> {
    if (amountUsd <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    ensureState(user);
    const toSymbol = toSupportedCoin(toSymbolValue);
    const usdRateTo = await rateService.getUsdRate(toSymbol);
    const cryptoAmount = formatAmount(amountUsd / usdRateTo);

    if (cryptoAmount <= 0) {
      throw new Error('Calculated crypto amount must be greater than zero');
    }

    user.debitUSD(amountUsd);
    user.adjustCryptoBalance(toSymbol, cryptoAmount);
    await user.save();

    const transaction = await logSwapTransaction({
      type: 'USD_TO_CRYPTO',
      userId: user._id as unknown as Types.ObjectId,
      fromSymbol: 'USD',
      toSymbol,
      fromAmount: amountUsd,
      toAmount: cryptoAmount,
      rate: cryptoAmount / amountUsd,
      usdRateTo,
    });

    return buildResult(user, transaction);
  },

  async cryptoToUsd(user: IUser, amountCrypto: number, fromSymbolValue: string): Promise<SwapResult> {
    if (amountCrypto <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    ensureState(user);
    const fromSymbol = toSupportedCoin(fromSymbolValue);
    const usdRateFrom = await rateService.getUsdRate(fromSymbol);
    const usdAmount = formatAmount(amountCrypto * usdRateFrom, 2);

    user.adjustCryptoBalance(fromSymbol, -amountCrypto);
    user.creditUSD(usdAmount);
    await user.save();

    const transaction = await logSwapTransaction({
      type: 'CRYPTO_TO_USD',
      userId: user._id as unknown as Types.ObjectId,
      fromSymbol,
      toSymbol: 'USD',
      fromAmount: amountCrypto,
      toAmount: usdAmount,
      rate: usdAmount / amountCrypto,
      usdRateFrom,
    });

    return buildResult(user, transaction);
  },

  async cryptoToCrypto(
    user: IUser,
    amountCrypto: number,
    fromSymbolValue: string,
    toSymbolValue: string
  ): Promise<SwapResult> {
    if (amountCrypto <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    ensureState(user);
    const fromSymbol = toSupportedCoin(fromSymbolValue);
    const toSymbol = toSupportedCoin(toSymbolValue);

    if (fromSymbol === toSymbol) {
      throw new Error('From and to symbols must be different');
    }

    const [usdRateFrom, usdRateTo] = await Promise.all([
      rateService.getUsdRate(fromSymbol),
      rateService.getUsdRate(toSymbol),
    ]);

    const usdValue = amountCrypto * usdRateFrom;
    const toAmount = formatAmount(usdValue / usdRateTo);

    user.adjustCryptoBalance(fromSymbol, -amountCrypto);
    user.adjustCryptoBalance(toSymbol, toAmount);
    await user.save();

    const transaction = await logSwapTransaction({
      type: 'CRYPTO_TO_CRYPTO',
      userId: user._id as unknown as Types.ObjectId,
      fromSymbol,
      toSymbol,
      fromAmount: amountCrypto,
      toAmount,
      rate: toAmount / amountCrypto,
      usdRateFrom,
      usdRateTo,
    });

    return buildResult(user, transaction);
  },
};
