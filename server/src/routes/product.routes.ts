/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */
import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, batchDeleteProducts } from '../controllers/product.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/', protect, getProducts);
router.post('/', protect, createProduct);
router.post('/batch-delete', protect, authorize('ADMIN'), batchDeleteProducts);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

export default router;
