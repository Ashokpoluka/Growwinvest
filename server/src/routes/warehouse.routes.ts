import express from 'express';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouse.controller';
import { protect } from '../middleware/protect.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getWarehouses);
router.post('/', authorize('ADMIN', 'MANAGER'), createWarehouse);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateWarehouse);
router.delete('/:id', authorize('ADMIN'), deleteWarehouse);

export default router;
