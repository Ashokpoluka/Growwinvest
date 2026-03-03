import express from 'express';
import { createPurchase, createSale, getTransactions } from '../controllers/transaction.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.post('/purchase', protect, createPurchase);
router.post('/sale', protect, createSale);
router.get('/', protect, getTransactions);

export default router;
