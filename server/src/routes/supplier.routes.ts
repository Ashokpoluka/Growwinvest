import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplier.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.get('/', protect, getSuppliers);
router.post('/', protect, createSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

export default router;
