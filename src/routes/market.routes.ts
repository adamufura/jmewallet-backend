import express from 'express';
import { getCoins, getCoinStats, getKlines, getOrderBook } from '../controllers/market.controller';

const router = express.Router();

// Market data routes (public - no auth required)
router.get('/coins', getCoins);
router.get('/coins/:symbol/stats', getCoinStats);
router.get('/coins/:symbol/klines', getKlines);
router.get('/coins/:symbol/orderbook', getOrderBook);

export default router;

