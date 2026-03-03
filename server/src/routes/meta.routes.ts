import express from 'express';
import { getCategories, createCategory, getSuppliers, createSupplier } from '../controllers/meta.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.get('/categories', protect, getCategories);
router.post('/categories', protect, createCategory);
router.get('/suppliers', protect, getSuppliers);
router.post('/suppliers', protect, createSupplier);

export default router;
