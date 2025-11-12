import axios from 'axios';
import { SupportedCoin } from '../types';
import { SUPPORTED_COINS } from '../models/user.model';

const DEFAULT_CACHE_TTL = Number(process.env.COIN_RATE_CACHE_TTL ?? '60000');
const COINGECKO_API_URL = process.env.COINGECKO_API_URL ?? 'https://api.coingecko.com/api/v3';

const SYMBOL_TO_COINGECKO_ID: Record<SupportedCoin, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TRX: 'tron',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  USDT_TRC20: 'tether',
  USDT_BEP20: 'tether',
  BTG: 'bitcoin-gold',
};

interface CacheEntry {
  value: number;
  expires: number;
}

const isSupportedCoin = (symbol: string): symbol is SupportedCoin =>
  SUPPORTED_COINS.includes(symbol as SupportedCoin);

const normalizeSymbol = (value: string | SupportedCoin): SupportedCoin => {
  const upper = value.toUpperCase();
  if (!isSupportedCoin(upper)) {
    throw new Error(`Unsupported coin symbol: ${value}`);
  }
  return upper as SupportedCoin;
};

class RateService {
  private cache = new Map<SupportedCoin, CacheEntry>();

  constructor(private readonly ttl: number = DEFAULT_CACHE_TTL) {}

  private async fetchUsdRates(symbols: SupportedCoin[]): Promise<Record<SupportedCoin, number>> {
    const uniqueSymbols = Array.from(new Set(symbols));
    if (uniqueSymbols.length === 0) {
      return {} as Record<SupportedCoin, number>;
    }

    const ids = uniqueSymbols
      .map((symbol) => SYMBOL_TO_COINGECKO_ID[symbol])
      .filter(Boolean)
      .join(',');

    if (!ids) {
      throw new Error('No valid CoinGecko IDs for requested symbols');
    }

    const url = `${COINGECKO_API_URL}/simple/price`;
    let data: Record<string, { usd: number }>;
    try {
      const response = await axios.get(url, {
        params: {
          ids,
          vs_currencies: 'usd',
        },
      });
      data = response.data;
    } catch (error) {
      throw new Error('Failed to fetch exchange rates from CoinGecko');
    }

    const rates = {} as Record<SupportedCoin, number>;

    uniqueSymbols.forEach((symbol) => {
      const coingeckoId = SYMBOL_TO_COINGECKO_ID[symbol];
      const usd = data?.[coingeckoId]?.usd;
      if (typeof usd !== 'number') {
        throw new Error(`Unable to fetch USD rate for ${symbol}`);
      }
      rates[symbol] = usd;
    });

    return rates;
  }

  private setCache(symbol: SupportedCoin, value: number) {
    this.cache.set(symbol, {
      value,
      expires: Date.now() + this.ttl,
    });
  }

  private getCachedRate(symbol: SupportedCoin) {
    const entry = this.cache.get(symbol);
    if (entry && entry.expires > Date.now()) {
      return entry.value;
    }
    return undefined;
  }

  public async getUsdRate(symbolValue: string | SupportedCoin): Promise<number> {
    if (symbolValue.toString().toUpperCase() === 'USD') {
      return 1;
    }
    const symbol = normalizeSymbol(symbolValue);
    const cached = this.getCachedRate(symbol);
    if (cached !== undefined) {
      return cached;
    }

    const rates = await this.fetchUsdRates([symbol]);
    const rate = rates[symbol];
    this.setCache(symbol, rate);
    return rate;
  }

  public async getUsdRates(symbols: (string | SupportedCoin)[]): Promise<Record<SupportedCoin, number>> {
    const normalized: SupportedCoin[] = symbols
      .filter((symbol) => symbol.toString().toUpperCase() !== 'USD')
      .map((symbol) => normalizeSymbol(symbol));

    const missing = normalized.filter((symbol) => this.getCachedRate(symbol) === undefined);
    if (missing.length > 0) {
      const fetched = await this.fetchUsdRates(missing);
      Object.entries(fetched).forEach(([symbol, rate]) => {
        this.setCache(symbol as SupportedCoin, rate as number);
      });
    }

    const result = {} as Record<SupportedCoin, number>;
    normalized.forEach((symbol) => {
      const cached = this.getCachedRate(symbol);
      if (cached === undefined) {
        throw new Error(`Missing cached rate for ${symbol}`);
      }
      result[symbol] = cached;
    });

    return result;
  }

  public clearCache() {
    this.cache.clear();
  }
}

export const rateService = new RateService();
