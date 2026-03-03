import express from 'express';
import { getUsers, updateUserRole } from '../controllers/users.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getUsers);
router.put('/:id/role', protect, authorize('ADMIN'), updateUserRole);

export default router;
